/**
 * Writes some objects somewhere.
 */
export interface Writer<T> {
  write(data: T): Promise<void>;
}
