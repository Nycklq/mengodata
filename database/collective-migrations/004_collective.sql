CREATE SCHEMA collective;

CREATE TABLE collective.competitions (
    competition_id text PRIMARY KEY CHECK (competition_id = 'competition:brasileirao-serie-a-men'),
    name text NOT NULL
);

CREATE TABLE collective.seasons (
    competition_id text NOT NULL REFERENCES collective.competitions,
    season integer NOT NULL CHECK (season = 2025),
    PRIMARY KEY (competition_id, season)
);

CREATE TABLE collective.clubs (
    club_id text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    source_name text NOT NULL UNIQUE
);

CREATE TABLE collective.imports (
    content_sha256 text PRIMARY KEY CHECK (content_sha256 ~ '^[a-f0-9]{64}$'),
    source_id text NOT NULL,
    source_url text NOT NULL CHECK (source_url ~ '^https://'),
    license text NOT NULL CHECK (license = 'CC0-1.0'),
    collected_at timestamptz NOT NULL,
    imported_at timestamptz NOT NULL DEFAULT now(),
    coverage_verified boolean NOT NULL CHECK (coverage_verified),
    gold jsonb NOT NULL
);

CREATE TABLE collective.matches (
    import_sha256 text NOT NULL REFERENCES collective.imports,
    match_id uuid NOT NULL,
    competition_id text NOT NULL,
    season integer NOT NULL,
    official_round smallint NOT NULL CHECK (official_round BETWEEN 1 AND 38),
    played_date date NOT NULL,
    home_id text NOT NULL REFERENCES collective.clubs,
    away_id text NOT NULL REFERENCES collective.clubs,
    home_goals smallint NOT NULL CHECK (home_goals >= 0),
    away_goals smallint NOT NULL CHECK (away_goals >= 0),
    source_locator text NOT NULL,
    PRIMARY KEY (import_sha256, match_id),
    FOREIGN KEY (competition_id, season) REFERENCES collective.seasons,
    UNIQUE (import_sha256, home_id, away_id),
    UNIQUE (import_sha256, source_locator),
    CHECK (home_id <> away_id)
);

CREATE INDEX collective_round_idx ON collective.matches (import_sha256, official_round);
CREATE INDEX collective_away_idx ON collective.matches (away_id, official_round);
CREATE INDEX collective_home_idx ON collective.matches (home_id, official_round);

CREATE VIEW collective.team_matches AS
SELECT import_sha256, match_id, competition_id, season, official_round, played_date,
    home_id AS club_id, away_id AS opponent_id, 'home'::text AS venue,
    home_goals AS goals_for, away_goals AS goals_against,
    1 AS played,
    (home_goals > away_goals)::integer AS wins,
    (home_goals = away_goals)::integer AS draws,
    (home_goals < away_goals)::integer AS losses,
    home_goals - away_goals AS goal_difference,
    CASE WHEN home_goals > away_goals THEN 3 WHEN home_goals = away_goals THEN 1 ELSE 0 END AS points,
    (away_goals = 0)::integer AS clean_sheets
FROM collective.matches
UNION ALL
SELECT import_sha256, match_id, competition_id, season, official_round, played_date,
    away_id, home_id, 'away'::text, away_goals, home_goals, 1,
    (away_goals > home_goals)::integer, (away_goals = home_goals)::integer,
    (away_goals < home_goals)::integer, away_goals - home_goals,
    CASE WHEN away_goals > home_goals THEN 3 WHEN away_goals = home_goals THEN 1 ELSE 0 END,
    (home_goals = 0)::integer
FROM collective.matches;

CREATE VIEW collective.club_totals AS
SELECT import_sha256, club_id, count(*)::integer AS played,
    sum(wins)::integer AS wins, sum(draws)::integer AS draws, sum(losses)::integer AS losses,
    sum(goals_for)::integer AS goals_for, sum(goals_against)::integer AS goals_against,
    sum(goal_difference)::integer AS goal_difference, sum(points)::integer AS points,
    sum(clean_sheets)::integer AS clean_sheets,
    sum(points) * 100.0 / (3 * count(*)) AS efficiency,
    sum(goals_for) * 1.0 / count(*) AS goals_for_average,
    sum(goals_against) * 1.0 / count(*) AS goals_against_average
FROM collective.team_matches
GROUP BY import_sha256, club_id;

CREATE VIEW collective.round_totals AS
SELECT import_sha256, club_id, official_round,
    sum(points) OVER club_window AS points,
    sum(goals_for) OVER club_window AS goals_for,
    sum(goals_against) OVER club_window AS goals_against,
    sum(goal_difference) OVER club_window AS goal_difference
FROM collective.team_matches
WINDOW club_window AS (PARTITION BY import_sha256, club_id ORDER BY official_round);
