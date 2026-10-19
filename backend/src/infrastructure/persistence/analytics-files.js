import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import {
  ANALYTICS_SCOPE,
  matchesAnalyticsScope,
} from '@flamengo-analytics/domain/scope';
import { countMetrics } from '@flamengo-analytics/domain/metrics';
import { z } from 'zod';
import { assessDataset, permissionAllowed } from '../../domain/dataset-approval.js';

const identity = z.string().uuid();
const number = z.number().finite().nonnegative().nullable();
export const artifactSchema = z
  .object({
    schema_version: z.literal(1),
    scope: z
      .object({
        competition_id: z.literal(ANALYTICS_SCOPE.competition_id),
        season: z.literal(2025),
        team_id: z.literal(ANALYTICS_SCOPE.team_id),
        first_round: z.literal(1),
        last_round: z.literal(38),
      })
      .strict(),
    source_id: z.string().min(1),
    dataset_version: z.string().min(1),
    collected_at: z.iso.datetime({ offset: true }),
    matches: z.array(
      z
        .object({
          match_id: identity,
          official_round: z.number().int().min(1).max(38),
          official_match_number: z.number().int().min(1).max(380),
          home_team_id: z.string().min(1),
          away_team_id: z.string().min(1),
          played_at: z.iso.datetime({ offset: true }),
          external_match_id: z.string().min(1),
          evidence_url: z.url().refine((value) => value.startsWith('https://')),
        })
        .strict(),
    ),
    players: z.array(
      z
        .object({
          player_id: identity,
          external_player_id: z.string().min(1),
          display_name: z.string().min(1),
          position: z.enum([
            'goalkeeper',
            'defender',
            'midfielder',
            'forward',
            'unknown',
          ]),
        })
        .strict(),
    ),
    appearances: z.array(
      z
        .object({
          player_id: identity,
          match_id: identity,
          competition_id: z.literal(ANALYTICS_SCOPE.competition_id),
          season: z.literal(2025),
          team_id: z.literal(ANALYTICS_SCOPE.team_id),
          official_round: z.number().int().min(1).max(38),
          starter: z.boolean().nullable(),
          ...Object.fromEntries(
            countMetrics.map((metric) => [
              metric,
              ['minutes', 'xg', 'xa'].includes(metric)
                ? number
                : z.number().int().nonnegative().nullable(),
            ]),
          ),
        })
        .strict(),
    ),
  })
  .strict();

async function readOptional(path) {
  try {
    return await readFile(path, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

export function createAnalyticsFiles({ root, purpose = 'display' }) {
  if (!['display', 'storage'].includes(purpose))
    throw new Error('INVALID_DATASET_PURPOSE');
  return {
    async read() {
      const blocked = {
        availability: 'unavailable',
        reason: 'individual_source_not_approved',
        coverage: null,
        dataset_version: null,
        source: null,
        players: [],
        appearances: [],
        permissions: { csv_export: false, power_bi_distribution: false },
        references: null,
      };
      const referenceText = await readOptional(
        join(root, 'data/analytics/references.json'),
      );
      const reviewText = await readOptional(
        join(root, 'contracts/source-approval.json'),
      );
      if (referenceText && reviewText) {
        const reference = JSON.parse(referenceText);
        const review = JSON.parse(reviewText).sources.find(
          (item) => item.source_id === reference.source_id,
        );
        const raw =
          /^[a-f0-9]{64}$/.test(reference.artifact_sha256) &&
          review?.reviewed_sha256 === reference.artifact_sha256
            ? await readOptional(
                join(
                  root,
                  'data/raw/openfootball',
                  `${reference.artifact_sha256}.json`,
                ),
              )
            : null;
        if (
          review?.technical_status === 'approved' &&
          review.reviewed_sha256 === reference.artifact_sha256 &&
          review.permissions.react_display.status === 'allowed' &&
          review.permissions.rest_api.status === 'allowed' &&
          review.approved_data_kinds.includes('match_reference') &&
          raw &&
          createHash('sha256').update(raw).digest('hex') ===
            reference.artifact_sha256 &&
          matchesAnalyticsScope(reference.scope)
        )
          blocked.references = {
            ...reference,
            matches: JSON.parse(raw).matches.flatMap((row, index) =>
              [row.team1, row.team2].includes('CR Flamengo')
                ? [
                    {
                      source_record_id: `/matches/${index}`,
                      source_round: Number(row.round.replace('Matchday ', '')),
                      played_on: row.date,
                      source_time: row.time ?? null,
                      time_zone: null,
                      home_team: row.team1,
                      away_team: row.team2,
                      score: Array.isArray(row.score)
                        ? row.score
                        : (row.score?.ft ?? null),
                      official_match_number: null,
                      official_event_id: null,
                    },
                  ]
                : [],
            ),
          };
      }
      const text = await readOptional(join(root, 'data/analytics/individual.json'));
      if (!text) return blocked;
      const registry = JSON.parse(
        await readFile(join(root, 'contracts/dataset-approvals.json'), 'utf8'),
      );
      const hash = createHash('sha256').update(text).digest('hex');
      const approval = registry.datasets.find(
        (item) =>
          item.sha256 === hash &&
          item.status === 'approved' &&
          item.data_kind === 'player_match',
      );
      const parsed = artifactSchema.safeParse(JSON.parse(text));
      if (!parsed.success) return { ...blocked, reason: 'invalid_individual_artifact' };
      const document = parsed.data;
      const sourceReview =
        reviewText &&
        JSON.parse(reviewText).sources.find(
          (row) => row.source_id === document.source_id,
        );
      const usages =
        purpose === 'storage'
          ? ['acquisition', 'academic_analysis', 'postgres_storage']
          : ['acquisition', 'academic_analysis', 'react_display', 'rest_api'];
      const assessment = assessDataset(document, approval, sourceReview, hash, usages);
      if (!assessment.authorized) return { ...blocked, reason: assessment.reason };
      return {
        ...blocked,
        ...document,
        source: {
          source_id: document.source_id,
          collected_at: document.collected_at,
          sha256: hash,
        },
        availability: assessment.availability,
        reason: assessment.reason,
        storage_authorized: permissionAllowed(approval, 'postgres_storage'),
        approval_reference: approval.evidence,
        coverage: assessment.coverage,
        permissions: {
          csv_export: permissionAllowed(approval, 'csv_export'),
          power_bi_distribution: permissionAllowed(approval, 'power_bi_distribution'),
        },
      };
    },
  };
}
