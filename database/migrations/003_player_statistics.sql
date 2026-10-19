CREATE TABLE analytics_imports (
    import_id uuid PRIMARY KEY,
    source_id text NOT NULL REFERENCES data_sources(source_id),
    dataset_version text NOT NULL CHECK (btrim(dataset_version) <> ''),
    content_sha256 text NOT NULL UNIQUE CHECK (content_sha256 ~ '^[a-f0-9]{64}$'),
    collected_at timestamptz NOT NULL,
    imported_at timestamptz NOT NULL DEFAULT now(),
    coverage_verified boolean NOT NULL,
    approval_reference text NOT NULL CHECK (approval_reference ~ '^https://[^/[:space:]]+'),
    UNIQUE (import_id, source_id)
);

ALTER TABLE matches ADD CONSTRAINT matches_identity_scope UNIQUE (match_id, competition_id, season, official_round);

CREATE TABLE player_match_statistics (
    import_id uuid NOT NULL,
    source_id text NOT NULL,
    player_id uuid NOT NULL REFERENCES players(player_id),
    match_id uuid NOT NULL REFERENCES matches(match_id),
    competition_id text NOT NULL CHECK (competition_id = 'competition:brasileirao-serie-a-men'),
    season integer NOT NULL CHECK (season = 2025),
    team_id text NOT NULL CHECK (team_id = 'club:flamengo'),
    official_round smallint NOT NULL CHECK (official_round BETWEEN 1 AND 38),
    position text NOT NULL CHECK (position IN ('goalkeeper', 'defender', 'midfielder', 'forward', 'unknown')),
    starter boolean,
    minutes numeric CHECK (minutes >= 0),
    goals integer CHECK (goals >= 0),
    assists integer CHECK (assists >= 0),
    shots integer CHECK (shots >= 0),
    shots_on_target integer CHECK (shots_on_target >= 0),
    tackles integer CHECK (tackles >= 0),
    interceptions integer CHECK (interceptions >= 0),
    clearances integer CHECK (clearances >= 0),
    blocks integer CHECK (blocks >= 0),
    passes_completed integer CHECK (passes_completed >= 0),
    passes_attempted integer CHECK (passes_attempted >= 0),
    yellow_cards integer CHECK (yellow_cards >= 0),
    red_cards integer CHECK (red_cards >= 0),
    xg numeric CHECK (xg >= 0),
    xa numeric CHECK (xa >= 0),
    PRIMARY KEY (import_id, player_id, match_id),
    FOREIGN KEY (import_id, source_id) REFERENCES analytics_imports(import_id, source_id),
    FOREIGN KEY (match_id, competition_id, season, official_round) REFERENCES matches(match_id, competition_id, season, official_round)
);

CREATE INDEX player_statistics_scope_idx ON player_match_statistics (season, team_id, player_id);

CREATE FUNCTION enforce_statistics_match_scope() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM matches
        WHERE match_id = NEW.match_id
            AND season = NEW.season
            AND official_round = NEW.official_round
            AND competition_id = NEW.competition_id
            AND NEW.team_id IN (home_team_id, away_team_id)
            AND status = 'finished'
    ) THEN
        RAISE EXCEPTION 'STATISTICS_MATCH_SCOPE_MISMATCH' USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
END
$$;

CREATE TRIGGER statistics_match_scope BEFORE INSERT OR UPDATE ON player_match_statistics
FOR EACH ROW EXECUTE FUNCTION enforce_statistics_match_scope();
