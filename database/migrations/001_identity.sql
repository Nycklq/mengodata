CREATE TABLE data_sources (
    source_id text PRIMARY KEY CHECK (source_id ~ '^[a-z0-9][a-z0-9:_-]{0,127}$'),
    name text NOT NULL CHECK (btrim(name) <> ''),
    approval_status text NOT NULL DEFAULT 'pending'
        CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    approval_reference text,
    CHECK (approval_status <> 'approved' OR (
        approval_reference IS NOT NULL
        AND approval_reference ~ '^https://[^/[:space:]]+'
    ))
);

CREATE TABLE players (
    player_id uuid PRIMARY KEY,
    display_name text NOT NULL CHECK (btrim(display_name) <> '')
);

CREATE TABLE player_source_ids (
    source_id text NOT NULL REFERENCES data_sources(source_id),
    external_player_id text NOT NULL CHECK (btrim(external_player_id) <> ''),
    player_id uuid NOT NULL REFERENCES players(player_id),
    PRIMARY KEY (source_id, external_player_id),
    UNIQUE (player_id, source_id)
);

CREATE TABLE matches (
    match_id uuid PRIMARY KEY,
    competition_id text NOT NULL
        CHECK (competition_id = 'competition:brasileirao-serie-a-men'),
    season integer NOT NULL CHECK (season = 2026),
    official_round smallint NOT NULL CHECK (official_round BETWEEN 1 AND 19),
    official_match_number smallint NOT NULL
        CHECK (official_match_number BETWEEN 1 AND 380),
    home_team_id text NOT NULL CHECK (home_team_id ~ '^[a-z0-9][a-z0-9:_-]{0,127}$'),
    away_team_id text NOT NULL CHECK (away_team_id ~ '^[a-z0-9][a-z0-9:_-]{0,127}$'),
    status text NOT NULL
        CHECK (status IN ('scheduled', 'postponed', 'suspended', 'cancelled', 'finished')),
    played_at timestamptz,
    CHECK (home_team_id <> away_team_id),
    CHECK ('club:flamengo' IN (home_team_id, away_team_id)),
    CHECK (status <> 'finished' OR played_at IS NOT NULL),
    UNIQUE (competition_id, season, official_round),
    UNIQUE (competition_id, season, official_match_number)
);

CREATE TABLE match_source_ids (
    source_id text NOT NULL REFERENCES data_sources(source_id),
    external_match_id text NOT NULL CHECK (btrim(external_match_id) <> ''),
    match_id uuid NOT NULL REFERENCES matches(match_id),
    evidence_url text NOT NULL CHECK (evidence_url ~ '^https://[^/[:space:]]+'),
    collected_at timestamptz NOT NULL,
    content_sha256 text NOT NULL CHECK (content_sha256 ~ '^[a-f0-9]{64}$'),
    PRIMARY KEY (source_id, external_match_id),
    UNIQUE (match_id, source_id)
);
