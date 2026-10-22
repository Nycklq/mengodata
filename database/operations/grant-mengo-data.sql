BEGIN;

DO $$
BEGIN
    IF current_database() <> 'mengo_data' THEN
        RAISE EXCEPTION 'MENGO_DATA_DATABASE_REQUIRED';
    END IF;
END
$$;

GRANT USAGE ON SCHEMA collective TO flamengo_app;

GRANT SELECT ON TABLE
    collective.competitions,
    collective.seasons,
    collective.clubs,
    collective.imports,
    collective.matches,
    collective.team_matches,
    collective.club_totals,
    collective.round_totals
TO flamengo_app;

GRANT INSERT ON TABLE
    collective.competitions,
    collective.seasons,
    collective.clubs,
    collective.imports,
    collective.matches
TO flamengo_app;

COMMIT;
