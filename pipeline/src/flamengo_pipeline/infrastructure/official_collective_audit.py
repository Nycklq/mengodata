import hashlib
import json
import re
from datetime import UTC, datetime
from pathlib import Path
from urllib.request import urlopen

from pypdf import PdfReader

TABLE_URL = "https://stcbfsiteprdimgbrs.blob.core.windows.net/img-site/cdn/BSA_25_Tabela_detalhada_08_12_d88b469845.pdf"
ALIASES = {
    "Atlético": "Atlético-MG",
    "Vasco da Gama": "Vasco",
    "Red Bull Bragantino": "Bragantino",
}


def parse_official_table(path):
    pattern = re.compile(
        r"^(\d{3})\s+(?:(\d{1,2})ª?\s+)?(?:(\d{2}/\d{2})\s+\S+\s+)?"
        r"\d{2}:\d{2}\s+(.+?)\s+[A-Z]{2}\s+(\d+)\s*x\s*(\d+)\s+"
        r"(.+?)\s+[A-Z]{2}\b"
    )
    rows = []
    for page in PdfReader(path).pages:
        for line in page.extract_text().splitlines():
            match = pattern.match(line.strip())
            if match:
                number, round_number, played, home, home_goals, away_goals, away = (
                    match.groups()
                )
                rows.append(
                    {
                        "cbf_match_number": int(number),
                        "official_round": int(round_number) if round_number else None,
                        "date": f"2025-{played[3:]}-{played[:2]}" if played else None,
                        "home_name": ALIASES.get(home, home),
                        "away_name": ALIASES.get(away, away),
                        "home_goals": int(home_goals),
                        "away_goals": int(away_goals),
                    }
                )
    return rows


def audit_official(document, destination, download_path):
    download_path = Path(download_path)
    download_path.parent.mkdir(parents=True, exist_ok=True)
    payload = urlopen(TABLE_URL, timeout=30).read()
    download_path.write_bytes(payload)
    official = parse_official_table(download_path)
    lookup = {(row["home_name"], row["away_name"]): row for row in official}
    differences = []
    compared = 0
    round_verified = 0
    for row in document["matches"]:
        reference = lookup.get((row["home_name"], row["away_name"]))
        if not reference:
            differences.append(
                {"match_id": row["match_id"], "kind": "not_parsed_in_official_pdf"}
            )
            continue
        compared += 1
        fields = ["home_goals", "away_goals"]
        if reference["date"] is not None:
            fields.append("date")
        if reference["official_round"] is not None:
            fields.append("official_round")
            round_verified += 1
        for field in fields:
            if row[field] != reference[field]:
                differences.append(
                    {
                        "match_id": row["match_id"],
                        "field": field,
                        "openfootball": row[field],
                        "cbf": reference[field],
                    }
                )
    report = {
        "checked_at": datetime.now(UTC).isoformat(),
        "dataset_version": document["dataset_version"],
        "official_url": TABLE_URL,
        "official_sha256": hashlib.sha256(payload).hexdigest(),
        "official_pdf_rows_parsed": len(official),
        "fixtures_compared": compared,
        "explicit_rounds_compared": round_verified,
        "explicit_dates_compared": sum(row["date"] is not None for row in official),
        "differences": differences,
        "round_note": "Células de rodada ausentes na extração não são "
        "inferidas pela data ou ordem de jogo.",
        "reference_matches": official,
    }
    Path(destination).write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    return {key: value for key, value in report.items() if key != "reference_matches"}
