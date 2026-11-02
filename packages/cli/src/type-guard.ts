// Canonical type guard for packages/cli. The package has no shared
// type-guard module and adds no npm dependencies, so this is the single
// definition per ts-no-local-is-record's standalone-package exception;
// import it — never recreate a local isRecord at call sites.
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
