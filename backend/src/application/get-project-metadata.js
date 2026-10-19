import { ANALYTICS_SCOPE, SCOPE_LABEL } from '@flamengo-analytics/domain/scope';

import { initialProjectReadiness } from '../domain/project-metadata.js';

export function getProjectMetadata() {
  const readiness = initialProjectReadiness();
  return {
    schema_version: 2,
    scope: { ...ANALYTICS_SCOPE },
    label: SCOPE_LABEL,
    source_status: readiness.sourceStatus,
    data_status: readiness.dataStatus,
    dataset_version: readiness.datasetVersion,
    coverage: readiness.coverage,
  };
}
