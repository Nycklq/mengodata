LOCK TABLE matches IN ACCESS EXCLUSIVE MODE;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM matches) THEN
        RAISE EXCEPTION 'SCOPE_MIGRATION_REQUIRES_EMPTY_MATCHES'
            USING ERRCODE = 'P0001';
    END IF;
END
$$;

ALTER TABLE matches DROP CONSTRAINT matches_season_check;
ALTER TABLE matches DROP CONSTRAINT matches_official_round_check;
ALTER TABLE matches ADD CONSTRAINT matches_season_check CHECK (season = 2025);
ALTER TABLE matches ADD CONSTRAINT matches_official_round_check
    CHECK (official_round BETWEEN 1 AND 38);
