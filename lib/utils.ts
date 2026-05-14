/** Safely convert any Firestore value to a string — prevents [object Object] rendering */
export function safeStr(val: unknown, fallback = ''): string {
  if (typeof val === 'string') return val;
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  return fallback; // Objects (Timestamps, nested objects) → fallback
}
