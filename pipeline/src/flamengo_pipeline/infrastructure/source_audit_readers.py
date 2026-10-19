import hashlib
import json
import math
import re
from dataclasses import asdict
from datetime import date
from pathlib import Path

import pandas as pd

from flamengo_pipeline.application.errors import ManifestInputError
from flamengo_pipeline.domain.models import ANALYTICS_SCOPE
from flamengo_pipeline.infrastructure.json_manifest_reader import (
    finite_float,
    reject_constant,
    unique_object,
)

SCOUT_MAPPING = {
    "goals": "G",
    "assists": "A",
    "tackles": "DS",
    "saved_shots": "FD",
    "shots_off_target": "FF",
    "shots_woodwork": "FT",
    "yellow_cards": "CA",
    "red_cards": "CV",
    "appearance_counter": "jogos",
}


def read_json(path):
    try:
        return json.loads(
            Path(path).read_text(encoding="utf-8"),
            object_pairs_hook=unique_object,
            parse_constant=reject_constant,
            parse_float=finite_float,
        )
    except (OSError, UnicodeError, json.JSONDecodeError) as error:
        raise ManifestInputError("audit_json_unreadable") from error


def fingerprint(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def read_source_reviews(path):
    document = read_json(path)
    if (
        not isinstance(document, dict)
        or document.get("schema_version") != 1
        or document.get("scope") != asdict(ANALYTICS_SCOPE)
        or not isinstance(document.get("sources"), list)
    ):
        raise ManifestInputError("invalid_source_review_registry")
    reviews = {}
    for row in document["sources"]:
        if (
            not isinstance(row, dict)
            or not isinstance(row.get("source_id"), str)
            or not row["source_id"]
            or row["source_id"] in reviews
            or re.fullmatch(r"[0-9a-f]{64}", str(row.get("reviewed_sha256"))) is None
        ):
            raise ManifestInputError("invalid_source_review_record")
        reviews[row["source_id"]] = row
    return reviews


def read_openfootball(path):
    document = read_json(path)
    if not isinstance(document, dict) or not isinstance(document.get("matches"), list):
        raise ManifestInputError("invalid_reference_document")
    if document.get("name") != "Brasileiro Série A 2025":
        raise ManifestInputError("unexpected_competition_or_season")
    records = []
    for index, row in enumerate(document["matches"]):
        if not isinstance(row, dict):
            raise ManifestInputError("invalid_reference_record")
        if "CR Flamengo" not in (row.get("team1"), row.get("team2")):
            continue
        label = re.fullmatch(r"Matchday ([1-9][0-9]?)", row["round"])
        if label is None:
            raise ManifestInputError("invalid_source_round")
        score = row.get("score")
        if isinstance(score, dict):
            score = score.get("ft")
        if score is not None and (not isinstance(score, list) or len(score) != 2):
            raise ManifestInputError("invalid_score_shape")
        records.append(
            {
                "source_record_id": f"/matches/{index}",
                "source_round": int(label[1]),
                "played_on": date.fromisoformat(row["date"]).isoformat(),
                "source_time": row.get("time"),
                "time_zone": None,
                "home_team": row["team1"],
                "away_team": row["team2"],
                "home_team_id": ANALYTICS_SCOPE.team_id
                if row["team1"] == "CR Flamengo"
                else None,
                "away_team_id": ANALYTICS_SCOPE.team_id
                if row["team2"] == "CR Flamengo"
                else None,
                "score": score,
                "official_match_number": None,
                "official_event_id": None,
            }
        )
    return {
        "matches": records,
        "sha256": fingerprint(path),
        "provenance": {"local_file": Path(path).name},
        "inventory": {
            "league_matches": len(document["matches"]),
            "reference_matches": records,
        },
    }


def read_snapshots(directory):
    root = Path(directory)
    path = root / "cartola_api_completo.csv"
    data = pd.read_csv(path)
    required = {
        "id_jogador",
        "rodada",
        "atletas.rodada_id",
        "atletas.clube_id",
        "posicao_id",
        "entrou_em_campo",
    }
    if not required.issubset(data.columns):
        raise ManifestInputError("snapshot_required_columns_missing")
    rows = []

    def integer(value):
        if (
            type(value) not in (int, float)
            or not math.isfinite(value)
            or int(value) != value
        ):
            raise ManifestInputError("invalid_snapshot_integer")
        return int(value)

    for row in data.to_dict("records"):
        if type(row["entrou_em_campo"]) is not bool:
            raise ManifestInputError("invalid_appearance_flag")
        rows.append(
            {
                "player_id": integer(row["id_jogador"]),
                "snapshot_round": integer(row["rodada"]),
                "declared_round": integer(row["atletas.rodada_id"]),
                "team_id": ANALYTICS_SCOPE.team_id
                if integer(row["atletas.clube_id"]) == 262
                else f"cartola:club:{integer(row['atletas.clube_id'])}",
                "club_label_consistent": row.get("clube_sigla") in (None, "FLA"),
                "participant_kind": "coach"
                if integer(row["posicao_id"]) == 6
                else "player",
                "appeared": row["entrou_em_campo"],
                "values": {
                    metric: None if pd.isna(row.get(field)) else row[field]
                    for metric, field in SCOUT_MAPPING.items()
                },
            }
        )
    inventory = []
    summary_path = root / "cartola_processado/resumo_rodadas.csv"
    summary = pd.read_csv(summary_path)
    renames = {
        "atletas.atleta_id": "id_jogador",
        "atletas.apelido": "apelido",
        "atletas.foto": "foto",
        "atletas.posicao_id": "posicao_id",
        "atletas.clube.id.full.name": "clube_nome",
        "atletas.pontos_num": "pontuacao",
        "atletas.preco_num": "preco",
        "atletas.variacao_num": "variacao_preco",
        "atletas.media_num": "media_pontos",
        "atletas.jogos_num": "jogos",
        "atletas.entrou_em_campo": "entrou_em_campo",
    }
    for number in range(1, 39):
        raw_path = root / f"cartola/rodada-{number}.csv"
        processed_path = root / f"cartola_processado/rodada-{number}_processado.csv"
        raw = pd.read_csv(raw_path)
        processed = pd.read_csv(processed_path)
        normalized = processed.rename(columns=renames).reindex(
            columns=[
                field
                for field in data.columns
                if field not in ("rodada", "clube_sigla")
            ]
        )
        subset = data.loc[data["rodada"].eq(number), normalized.columns].reset_index(
            drop=True
        )
        same_values = (
            len(normalized) == len(subset)
            and (normalized.eq(subset) | (normalized.isna() & subset.isna()))
            .all()
            .all()
        )
        summary_rows = summary.loc[summary["Rodada"].eq(number)]
        inventory.append(
            {
                "snapshot_round": number,
                "raw_rows": len(raw),
                "raw_columns": len(raw.columns),
                "raw_sha256": fingerprint(raw_path),
                "processed_rows": len(processed),
                "processed_columns": len(processed.columns),
                "processed_sha256": fingerprint(processed_path),
                "raw_declared_rounds": sorted(
                    raw["atletas.rodada_id"].unique().tolist()
                ),
                "raw_duplicate_keys": int(
                    raw.duplicated(["atletas.atleta_id", "atletas.rodada_id"]).sum()
                ),
                "original_columns_preserved": set(raw.columns).issubset(
                    processed.columns
                )
                and raw.equals(processed[list(raw.columns)]),
                "consolidated_values_preserved": bool(same_values),
                "summary_row_count_consistent": len(summary_rows) == 1
                and int(summary_rows.iloc[0]["Total Jogadores"]) == len(raw),
            }
        )
    return {
        "rows": rows,
        "sha256": fingerprint(path),
        "provenance": {"local_file": path.name},
        "inventory": {
            "columns_and_inferred_types": data.dtypes.astype(str).to_dict(),
            "snapshots": inventory,
            "summary": {
                "row_count": len(summary),
                "columns_and_inferred_types": summary.dtypes.astype(str).to_dict(),
                "sha256": fingerprint(summary_path),
            },
        },
    }
