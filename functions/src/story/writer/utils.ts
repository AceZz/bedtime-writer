/**
 * Convert `undefined` to `null`, and return `value` otherwise.
 *
 * This is useful when inserting data into Firestore, which does not handle
 * `undefined`.
 */
export function valueOrNull(value: string | undefined): string | null {
  return value === undefined ? null : value;
}
