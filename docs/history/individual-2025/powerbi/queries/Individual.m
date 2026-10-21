let
    Documento = Json.Document(File.Contents(CaminhoGold)),
    Permitido = Record.FieldOrDefault(Documento, "distribution_allowed", false) = true,
    Disponivel = List.Contains({"available", "partial"}, Record.FieldOrDefault(Documento, "availability", "unavailable")),
    Linhas = if Permitido and Disponivel then Record.FieldOrDefault(Documento, "appearances", {}) else {},
    Tipo = type table [player_id = text, match_id = text, competition_id = text, season = Int64.Type, team_id = text, official_round = Int64.Type, starter = nullable logical, minutes = nullable number, goals = nullable number, assists = nullable number, shots = nullable number, shots_on_target = nullable number, tackles = nullable number, interceptions = nullable number, clearances = nullable number, blocks = nullable number, passes_completed = nullable number, passes_attempted = nullable number, yellow_cards = nullable number, red_cards = nullable number, xg = nullable number, xa = nullable number],
    FatoBruto = Table.FromRecords(Linhas, Tipo, MissingField.UseNull),
    Fato = Table.SelectRows(FatoBruto, each [season] = 2025 and [team_id] = "club:flamengo" and [competition_id] = "competition:brasileirao-serie-a-men" and [official_round] >= 1 and [official_round] <= 38),
    Jogadores = if Permitido and Disponivel then Record.FieldOrDefault(Documento, "players", {}) else {},
    Partidas = if Permitido and Disponivel then Record.FieldOrDefault(Documento, "matches", {}) else {},
    DimJogador = Table.FromRecords(Jogadores, type table [player_id = text, display_name = text, position = text], MissingField.UseNull),
    DimPartida = Table.FromRecords(Partidas, type table [match_id = text, official_round = Int64.Type, official_match_number = Int64.Type, home_team_id = text, away_team_id = text, played_at = text, external_match_id = text, evidence_url = text], MissingField.UseNull),
    Metadata = #table(type table [availability = text, coverage_verified = logical, distribution_allowed = logical], {{Record.FieldOrDefault(Documento, "availability", "unavailable"), Record.FieldOrDefault(Documento, "coverage_verified", false), Permitido}})
in
    [Fato = Fato, DimJogador = DimJogador, DimPartida = DimPartida, Metadata = Metadata]
