/**
 * Reads a source and returns some type.
 */
export interface Reader<T> {
  read(): Promise<T>;
}
