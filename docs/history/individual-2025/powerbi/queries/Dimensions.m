let
    DimPosicao = #table(type table [position = text, label = text], {{"goalkeeper", "Goleiro"}, {"defender", "Defensor"}, {"midfielder", "Meio-campista"}, {"forward", "Atacante"}, {"unknown", "Não informada"}}),
    DimEquipe = #table(type table [team_id = text, label = text], {{"club:flamengo", "Flamengo"}}),
    DimTemporada = #table(type table [season = Int64.Type], {{2025}}),
    DimCompeticao = #table(type table [competition_id = text, label = text], {{"competition:brasileirao-serie-a-men", "Brasileirão Série A masculino"}}),
    MinimoMinutos = #table(type table [minutes = Int64.Type], {{0}, {450}, {900}, {1500}})
in
    [DimPosicao = DimPosicao, DimEquipe = DimEquipe, DimTemporada = DimTemporada, DimCompeticao = DimCompeticao, MinimoMinutos = MinimoMinutos]
