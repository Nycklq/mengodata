export async function importStatistics(readApprovedDataset, repository) {
  const snapshot = await readApprovedDataset();
  if (
    !['available', 'partial'].includes(snapshot.availability) ||
    snapshot.storage_authorized !== true
  )
    throw new Error('STATISTICS_STORAGE_NOT_AUTHORIZED');
  return repository.store(snapshot);
}
