/**
 * A JSON array kept in localStorage, shaped for useSyncExternalStore: the
 * snapshot only changes when the stored string does, and every change (in
 * this tab or another) notifies subscribers. Client-only.
 */
export function createLocalStore<T>(key: string) {
  const EMPTY: T[] = [];
  const listeners = new Set<() => void>();
  let cachedRaw: string | null = null;
  let cached: T[] = EMPTY;

  function read(): T[] {
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(key);
    } catch {
      // Storage blocked: behave as empty.
    }
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      try {
        const parsed = JSON.parse(raw ?? "[]");
        cached = Array.isArray(parsed) ? parsed : EMPTY;
      } catch {
        cached = EMPTY;
      }
    }
    return cached;
  }

  function write(update: (current: T[]) => T[]) {
    const next = update(read());
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // Private mode or storage full: nothing to persist to.
    }
    listeners.forEach((l) => l());
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => e.key === key && listener();
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  /** What the server and the first client render see. */
  const serverSnapshot = () => EMPTY;

  return { read, write, subscribe, serverSnapshot };
}
