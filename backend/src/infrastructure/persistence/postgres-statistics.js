import { randomUUID } from 'node:crypto';
import { countMetrics } from '@flamengo-analytics/domain/metrics';

export function createPostgresStatistics(pool) {
  return {
    async store(snapshot) {
      if (
        !['available', 'partial'].includes(snapshot.availability) ||
        snapshot.storage_authorized !== true ||
        !snapshot.source?.sha256 ||
        !snapshot.approval_reference
      )
        throw new Error('STATISTICS_STORAGE_NOT_AUTHORIZED');
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query('SELECT pg_advisory_xact_lock($1)', [20250301]);
        const existing = await client.query(
          'SELECT import_id FROM analytics_imports WHERE content_sha256 = $1',
          [snapshot.source.sha256],
        );
        if (existing.rows.length) {
          await client.query('COMMIT');
          return { changed: false, import_id: existing.rows[0].import_id };
        }
        const importId = randomUUID();
        await client.query(
          'INSERT INTO data_sources (source_id, name, approval_status, approval_reference) VALUES ($1,$1,$2,$3) ON CONFLICT (source_id) DO UPDATE SET approval_status = EXCLUDED.approval_status, approval_reference = EXCLUDED.approval_reference',
          [snapshot.source_id, 'approved', snapshot.approval_reference],
        );
        await client.query(
          'INSERT INTO analytics_imports (import_id,source_id,dataset_version,content_sha256,collected_at,coverage_verified,approval_reference) VALUES ($1,$2,$3,$4,$5,$6,$7)',
          [
            importId,
            snapshot.source_id,
            snapshot.dataset_version,
            snapshot.source.sha256,
            snapshot.collected_at,
            snapshot.availability === 'available',
            snapshot.approval_reference,
          ],
        );
        for (const player of snapshot.players) {
          await client.query(
            'INSERT INTO players (player_id,display_name) VALUES ($1,$2) ON CONFLICT (player_id) DO UPDATE SET display_name = EXCLUDED.display_name',
            [player.player_id, player.display_name],
          );
          const linked = await client.query(
            'INSERT INTO player_source_ids (source_id,external_player_id,player_id) VALUES ($1,$2,$3) ON CONFLICT (source_id,external_player_id) DO UPDATE SET player_id = player_source_ids.player_id RETURNING player_id',
            [snapshot.source_id, player.external_player_id, player.player_id],
          );
          if (linked.rows[0].player_id !== player.player_id)
            throw new Error('PLAYER_SOURCE_IDENTITY_CONFLICT');
        }
        for (const match of snapshot.matches) {
          const storedMatch = await client.query(
            'INSERT INTO matches (match_id,competition_id,season,official_round,official_match_number,home_team_id,away_team_id,status,played_at) VALUES ($1,$2,2025,$3,$4,$5,$6,$7,$8) ON CONFLICT (match_id) DO UPDATE SET match_id = matches.match_id RETURNING official_round,official_match_number,home_team_id,away_team_id,status,played_at',
            [
              match.match_id,
              snapshot.scope.competition_id,
              match.official_round,
              match.official_match_number,
              match.home_team_id,
              match.away_team_id,
              'finished',
              match.played_at,
            ],
          );
          const stored = storedMatch.rows[0];
          if (
            stored.official_round !== match.official_round ||
            stored.official_match_number !== match.official_match_number ||
            stored.home_team_id !== match.home_team_id ||
            stored.away_team_id !== match.away_team_id ||
            stored.status !== 'finished' ||
            stored.played_at.toISOString() !== new Date(match.played_at).toISOString()
          )
            throw new Error('MATCH_IDENTITY_CONFLICT');
          const linkedMatch = await client.query(
            'INSERT INTO match_source_ids (source_id,external_match_id,match_id,evidence_url,collected_at,content_sha256) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (source_id,external_match_id) DO UPDATE SET match_id = match_source_ids.match_id RETURNING match_id',
            [
              snapshot.source_id,
              match.external_match_id,
              match.match_id,
              match.evidence_url,
              snapshot.collected_at,
              snapshot.source.sha256,
            ],
          );
          if (linkedMatch.rows[0].match_id !== match.match_id)
            throw new Error('MATCH_SOURCE_IDENTITY_CONFLICT');
        }
        const fields = [
          'import_id',
          'source_id',
          'player_id',
          'match_id',
          'competition_id',
          'season',
          'team_id',
          'official_round',
          'position',
          'starter',
          ...countMetrics,
        ];
        const sql = `INSERT INTO player_match_statistics (${fields.join(',')}) VALUES (${fields.map((_, index) => '$' + (index + 1)).join(',')})`;
        for (const row of snapshot.appearances) {
          const player = snapshot.players.find(
            (item) => item.player_id === row.player_id,
          );
          const values = {
            ...row,
            import_id: importId,
            source_id: snapshot.source_id,
            position: player.position,
          };
          await client.query(
            sql,
            fields.map((field) => values[field] ?? null),
          );
        }
        await client.query('COMMIT');
        return {
          changed: true,
          import_id: importId,
          appearances: snapshot.appearances.length,
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
