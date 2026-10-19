export const countMetrics = [
  'minutes',
  'goals',
  'assists',
  'shots',
  'shots_on_target',
  'tackles',
  'interceptions',
  'clearances',
  'blocks',
  'passes_completed',
  'passes_attempted',
  'yellow_cards',
  'red_cards',
  'xg',
  'xa',
];

export const derivedMetrics = [
  'contributions',
  'goals_per90',
  'assists_per90',
  'contributions_per90',
  'conversion_pct',
  'pass_accuracy_pct',
];

export function completeSum(values) {
  if (
    !values.length ||
    values.some(
      (value) => typeof value !== 'number' || !Number.isFinite(value) || value < 0,
    )
  )
    return null;
  return values.reduce((total, value) => total + value, 0);
}

export function safeRatio(numerator, denominator, multiplier = 1) {
  if (
    numerator === null ||
    denominator === null ||
    !Number.isFinite(numerator) ||
    !Number.isFinite(denominator) ||
    numerator < 0 ||
    denominator <= 0
  )
    return null;
  return (numerator * multiplier) / denominator;
}

export function aggregateAppearances(rows) {
  const metrics = Object.fromEntries(
    countMetrics.map((field) => [
      field,
      completeSum(rows.map((row) => row[field] ?? null)),
    ]),
  );
  metrics.matches = rows.length ? new Set(rows.map((row) => row.match_id)).size : null;
  metrics.starts =
    rows.length && rows.every((row) => typeof row.starter === 'boolean')
      ? rows.filter((row) => row.starter).length
      : null;
  metrics.contributions = completeSum([metrics.goals, metrics.assists]);
  metrics.goals_per90 = safeRatio(metrics.goals, metrics.minutes, 90);
  metrics.assists_per90 = safeRatio(metrics.assists, metrics.minutes, 90);
  metrics.contributions_per90 = safeRatio(metrics.contributions, metrics.minutes, 90);
  metrics.conversion_pct = safeRatio(metrics.goals, metrics.shots, 100);
  metrics.pass_accuracy_pct = safeRatio(
    metrics.passes_completed,
    metrics.passes_attempted,
    100,
  );
  return metrics;
}

export function quantile(values, probability) {
  if (!Number.isFinite(probability) || probability < 0 || probability > 1) return null;
  const sorted = values
    .filter((value) => typeof value === 'number' && Number.isFinite(value))
    .toSorted((left, right) => left - right);
  if (!sorted.length) return null;
  const index = (sorted.length - 1) * probability;
  const lower = Math.floor(index);
  return sorted[lower] + (sorted[Math.ceil(index)] - sorted[lower]) * (index - lower);
}

export function describeDistribution(values) {
  const observed = values.filter(
    (value) => typeof value === 'number' && Number.isFinite(value),
  );
  if (!observed.length)
    return {
      sample_size: 0,
      mean: null,
      median: null,
      q1: null,
      q3: null,
      minimum: null,
      maximum: null,
      outliers: [],
    };
  const q1 = quantile(observed, 0.25);
  const q3 = quantile(observed, 0.75);
  const spread = q3 - q1;
  return {
    sample_size: observed.length,
    mean: observed.reduce((sum, value) => sum + value, 0) / observed.length,
    median: quantile(observed, 0.5),
    q1,
    q3,
    minimum: Math.min(...observed),
    maximum: Math.max(...observed),
    outliers: observed.filter(
      (value) => value < q1 - 1.5 * spread || value > q3 + 1.5 * spread,
    ),
  };
}
