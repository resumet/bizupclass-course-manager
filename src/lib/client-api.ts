export async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "요청을 처리하지 못했습니다.");
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function nullable(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function isHttpUrl(value: string) {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

export function kstDateTimeToIso(value: string) {
  return value ? new Date(`${value}:00+09:00`).toISOString() : null;
}

export function kstDateToIso(value: string) {
  return value ? new Date(`${value}T00:00:00+09:00`).toISOString() : null;
}

export function isoToKstDateTime(value: string | null) {
  if (!value) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}

export function isoToKstDate(value: string | null) {
  return isoToKstDateTime(value).slice(0, 10);
}

export function formatKoreanDate(value: string | null, withTime = false) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(new Date(value));
}
