export function load<T>(k:string, fallback:T): T {
  if (typeof window === "undefined") return fallback;
  try { const s = localStorage.getItem(k); return s ? JSON.parse(s) as T : fallback; } catch { return fallback; }
}
export function save<T>(k:string, v:T) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
}
