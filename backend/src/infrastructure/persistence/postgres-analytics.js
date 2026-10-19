import { countMetrics } from '@flamengo-analytics/domain/metrics';

export function createPostgresAnalytics(pool, approvalRepository) {
  return {
    async read() {
      const approved = await approvalRepository.read();
      if (!['available', 'partial'].includes(approved.availability)) return approved;
      const fields = countMetrics
        .map((field) => `statistics.${field}::float8 AS ${field}`)
        .join(',');
      const result = await pool.query(
        `SELECT statistics.player_id, statistics.match_id, statistics.competition_id, statistics.season, statistics.team_id, statistics.official_round, statistics.starter, ${fields} FROM player_match_statistics AS statistics JOIN analytics_imports AS imports ON imports.import_id = statistics.import_id WHERE imports.content_sha256 = $1 AND statistics.season = $2 AND statistics.team_id = $3 AND statistics.competition_id = $4 AND statistics.official_round BETWEEN $5 AND $6 ORDER BY statistics.official_round, statistics.player_id`,
        [
          approved.source.sha256,
          2025,
          approved.scope.team_id,
          approved.scope.competition_id,
          1,
          38,
        ],
      );
      if (result.rows.length !== approved.appearances.length)
        return {
          ...approved,
          availability: 'unavailable',
          reason: 'approved_dataset_not_loaded_in_postgres',
          players: [],
          appearances: [],
          coverage: null,
          dataset_version: null,
        };
      return { ...approved, appearances: result.rows };
    },
  };
}
