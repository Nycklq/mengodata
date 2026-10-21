import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { z } from 'zod';
import { matchesAnalyticsScope } from '@flamengo-analytics/domain/scope';

const record = z
  .object({
    match_id: z.uuid(),
    official_round: z.number().int().min(1).max(38),
    season: z.literal(2025),
    home_goals: z.number().int().nonnegative(),
    away_goals: z.number().int().nonnegative(),
    home_id: z.string(),
    away_id: z.string(),
  })
  .passthrough();
const schema = z
  .object({
    dataset_version: z.string().regex(/^[a-f0-9]{64}$/),
    scope: z.object({}).passthrough(),
    matches: z.array(record).length(380),
    clubs: z
      .array(z.object({ club_id: z.string(), name: z.string() }).passthrough())
      .length(20),
    team_matches: z.array(z.object({}).passthrough()).length(760),
    coverage: z.object({ status: z.literal('verified') }).passthrough(),
  })
  .passthrough();

export function createCollectiveFiles(root) {
  return {
    async read() {
      let document;
      try {
        document = JSON.parse(
          await readFile(join(root, 'data/analytics/collective.json'), 'utf8'),
        );
      } catch (error) {
        if (error.code === 'ENOENT') return null;
        throw error;
      }
      schema.parse(document);
      if (!matchesAnalyticsScope(document.scope))
        throw new Error('COLLECTIVE_SCOPE_MISMATCH');
      const approval = JSON.parse(
        await readFile(join(root, 'contracts/collective-source.json'), 'utf8'),
      );
      const raw = await readFile(
        join(
          root,
          'data/raw/collective/season=2025/competition=brasileirao-serie-a-men',
          `${document.dataset_version}.json`,
        ),
      );
      if (
        createHash('sha256').update(raw).digest('hex') !== approval.reviewed_sha256 ||
        document.dataset_version !== approval.reviewed_sha256
      )
        throw new Error('UNREVIEWED_COLLECTIVE_DATA');
      const originals = JSON.parse(raw).matches;
      if (
        new Set(document.matches.map((row) => row.match_id)).size !== 380 ||
        new Set(document.matches.map((row) => row.source_locator)).size !== 380
      )
        throw new Error('COLLECTIVE_DUPLICATE_MATCH');
      const clubs = JSON.parse(
        await readFile(join(root, 'contracts/clubs.json'), 'utf8'),
      );
      if (JSON.stringify(clubs) !== JSON.stringify(document.clubs))
        throw new Error('COLLECTIVE_CLUB_MISMATCH');
      const clubNames = new Map(
        document.clubs.map((row) => [row.club_id, row.source_name]),
      );
      for (const row of document.matches) {
        const index = Number(row.source_locator.match(/^matches\[(\d+)\]$/)?.[1]);
        const source = originals[index];
        const score = Array.isArray(source?.score) ? source.score : source?.score?.ft;
        if (
          !source ||
          source.round !== `Matchday ${row.official_round}` ||
          source.date !== row.date ||
          source.team1 !== clubNames.get(row.home_id) ||
          source.team2 !== clubNames.get(row.away_id) ||
          score?.[0] !== row.home_goals ||
          score?.[1] !== row.away_goals
        )
          throw new Error('COLLECTIVE_PROVENANCE_MISMATCH');
      }
      const matches = new Map(document.matches.map((row) => [row.match_id, row]));
      const factKeys = new Set();
      for (const fact of document.team_matches) {
        const match = matches.get(fact.match_id);
        const side =
          fact.venue === 'home' ? 'home' : fact.venue === 'away' ? 'away' : null;
        const other = side === 'home' ? 'away' : 'home';
        if (!match || !side) throw new Error('COLLECTIVE_FACT_MISMATCH');
        const gf = match[side + '_goals'],
          ga = match[other + '_goals'];
        const expected = {
          club_id: match[side + '_id'],
          name: match[side + '_name'],
          opponent_id: match[other + '_id'],
          official_round: match.official_round,
          date: match.date,
          season: 2025,
          competition_id: document.scope.competition_id,
          played: 1,
          goals_for: gf,
          goals_against: ga,
          goal_difference: gf - ga,
          wins: Number(gf > ga),
          draws: Number(gf === ga),
          losses: Number(gf < ga),
          points: gf > ga ? 3 : gf === ga ? 1 : 0,
          clean_sheets: Number(ga === 0),
          result: gf > ga ? 'W' : gf === ga ? 'D' : 'L',
        };
        if (
          Object.entries(expected).some(([key, value]) => fact[key] !== value) ||
          factKeys.has(fact.match_id + '/' + fact.club_id)
        )
          throw new Error('COLLECTIVE_FACT_MISMATCH');
        factKeys.add(fact.match_id + '/' + fact.club_id);
      }
      return document;
    },
  };
}
