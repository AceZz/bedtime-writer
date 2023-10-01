export class BucketRateLimiterEntry {
  constructor(
    readonly uid: string,
    readonly bucket: string,
    readonly tokens: number,
    readonly lastUpdated: Date
  ) {}
}

/**
 * Deals with the data of a `BucketRateLimiter`.
 */
export interface BucketRateLimiterStorage {
  /**
   * Read token entries.
   *
   * If a bucket is not present in the storage, its key should not be in the
   * returned Map.
   */
  readEntries(
    uid: string,
    buckets: string[]
  ): Promise<Map<string, BucketRateLimiterEntry>>;

  /**
   * Write token entries.
   *
   * This operation is atomic: either all entries are written or none are.
   */
  writeEntries(uid: string, tokens: Map<string, number>): Promise<void>;
}
