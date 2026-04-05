// app/utils/clone.ts | Utility | Shared
// Provides a safe deep clone for Vue state before persistence.
// Uses structuredClone when available, falls back to JSON for plain data.

export function deepClone<T>(value: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}
