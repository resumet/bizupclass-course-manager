const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

export function getTrafficPeriodStarts(now = new Date()) {
  const kst = new Date(now.getTime() + KST_OFFSET_MS);
  const year = kst.getUTCFullYear();
  const month = kst.getUTCMonth();
  const date = kst.getUTCDate();
  const daysSinceMonday = (kst.getUTCDay() + 6) % 7;
  const today = new Date(Date.UTC(year, month, date) - KST_OFFSET_MS);
  const thisWeek = new Date(
    Date.UTC(year, month, date - daysSinceMonday) - KST_OFFSET_MS,
  );

  return { today: today.toISOString(), thisWeek: thisWeek.toISOString() };
}

export function decodeLocationHeader(value: string | null) {
  if (!value) return null;
  try {
    return decodeURIComponent(value).slice(0, 200);
  } catch {
    return value.slice(0, 200);
  }
}
