export function createPostgresCollective(pool, files) {
  return {
    async read() {
      const expected = await files.read();
      if (!expected) return null;
      const result = await pool.query(
        'SELECT gold FROM collective.imports WHERE content_sha256 = $1 AND coverage_verified',
        [expected.dataset_version],
      );
      return result.rows[0]?.gold ?? null;
    },
    async store(document) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query('SELECT pg_advisory_xact_lock($1)', [20251021]);
        const existing = await client.query(
          'SELECT content_sha256 FROM collective.imports WHERE content_sha256 = $1',
          [document.dataset_version],
        );
        if (existing.rowCount) {
          await client.query('COMMIT');
          return {
            changed: false,
            matches: document.matches.length,
            dataset_version: document.dataset_version,
          };
        }
        await client.query(
          'INSERT INTO collective.competitions VALUES ($1,$2) ON CONFLICT DO NOTHING',
          [document.scope.competition_id, 'Brasileirão Série A masculino'],
        );
        await client.query(
          'INSERT INTO collective.seasons VALUES ($1,$2) ON CONFLICT DO NOTHING',
          [document.scope.competition_id, 2025],
        );
        for (const row of document.clubs)
          await client.query(
            'INSERT INTO collective.clubs VALUES ($1,$2,$3) ON CONFLICT (club_id) DO NOTHING',
            [row.club_id, row.name, row.source_name],
          );
        await client.query(
          'INSERT INTO collective.imports (content_sha256,source_id,source_url,license,collected_at,coverage_verified,gold) VALUES ($1,$2,$3,$4,$5,true,$6)',
          [
            document.dataset_version,
            document.source.source_id,
            document.source.url,
            document.source.license,
            document.source.collected_at,
            document,
          ],
        );
        for (const row of document.matches)
          await client.query(
            'INSERT INTO collective.matches VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
            [
              document.dataset_version,
              row.match_id,
              row.competition_id,
              row.season,
              row.official_round,
              row.date,
              row.home_id,
              row.away_id,
              row.home_goals,
              row.away_goals,
              row.source_locator,
            ],
          );
        const counts = await client.query(
          'SELECT count(*)::int AS matches, count(DISTINCT official_round)::int AS rounds FROM collective.matches WHERE import_sha256 = $1',
          [document.dataset_version],
        );
        if (counts.rows[0].matches !== 380 || counts.rows[0].rounds !== 38)
          throw new Error('INCOMPLETE_DATABASE_IMPORT');
        await client.query('COMMIT');
        return {
          changed: true,
          ...counts.rows[0],
          dataset_version: document.dataset_version,
        };
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },
  };
}
