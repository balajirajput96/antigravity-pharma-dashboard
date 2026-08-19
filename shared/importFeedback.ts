export function shouldAnnounceFirstImport(
  previousRunId: number | null | undefined,
  currentRunId: number | null,
  announcedRunId: number | null
) {
  return (
    previousRunId === null &&
    currentRunId !== null &&
    announcedRunId !== currentRunId
  );
}

export function isFirstImportPending(
  hasLatestRun: boolean,
  awaitingFirstImport: boolean,
  scheduleActivationPending: boolean
) {
  return !hasLatestRun && (awaitingFirstImport || scheduleActivationPending);
}
