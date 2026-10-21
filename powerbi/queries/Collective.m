let
    Pasta = "C:\Users\Nicol\Flamengo-Analytics\data\powerbi",
    Ler = (Nome as text, Tipos as list) as table =>
        Table.TransformColumnTypes(
            Table.PromoteHeaders(Csv.Document(File.Contents(Pasta & "\" & Nome & ".csv"), [Delimiter = ",", Encoding = 65001, QuoteStyle = QuoteStyle.Csv]), [PromoteAllScalars = true]),
            Tipos,
            "en-US"
        ),
    Contagens = List.Transform({"played", "wins", "draws", "losses", "goals_for", "goals_against", "goal_difference", "points", "clean_sheets"}, each {_, Int64.Type}),
    TeamMatches = Ler("TeamMatches", List.Combine({Contagens, {{"season", Int64.Type}, {"official_round", Int64.Type}, {"date", type date}}})),
    Clubs = Ler("Clubs", {{"club_id", type text}, {"name", type text}, {"source_name", type text}}),
    Matches = Ler("Matches", {{"official_round", Int64.Type}, {"season", Int64.Type}, {"date", type date}, {"home_goals", Int64.Type}, {"away_goals", Int64.Type}}),
    Rounds = Ler("Rounds", {{"official_round", Int64.Type}}),
    Seasons = Ler("Seasons", {{"season", Int64.Type}}),
    Standings = Ler("Standings", List.Combine({Contagens, {{"official_round", Int64.Type}, {"position", Int64.Type}, {"efficiency", type number}, {"goals_for_average", type number}, {"goals_against_average", type number}, {"tied", type logical}}})),
    Provenance = Ler("Provenance", {{"coverage_verified", type logical}}),
    ClubeComparado = Table.SelectColumns(Clubs, {"club_id", "name"})
in
    [TeamMatches = TeamMatches, Clubs = Clubs, Matches = Matches, Rounds = Rounds, Seasons = Seasons, Standings = Standings, Provenance = Provenance, ClubeComparado = ClubeComparado]
