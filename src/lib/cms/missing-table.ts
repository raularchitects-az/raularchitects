export function isMissingRelationError(error: { code?: string; message?: string } | null | undefined) {
  if (!error) return false;
  const message = error.message ?? "";
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    /Could not find the table/i.test(message) ||
    /relation .* does not exist/i.test(message)
  );
}
