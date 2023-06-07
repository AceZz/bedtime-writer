import {
  BucketRateLimiterEntry,
  BucketRateLimiterStorage,
} from "../../../src/rate_limiter/bucket_rate_limiter/bucket_rate_limiter_storage";

/**
 * In-memory storage used for testing the `BucketRateLimiter`.
 */
export class FakeBucketRateLimiterStorage implements BucketRateLimiterStorage {
  constructor(
    public entries: Map<string, Map<string, BucketRateLimiterEntry>> = new Map()
  ) {}

  async readEntries(
    uid: string,
    buckets: string[]
  ): Promise<Map<string, BucketRateLimiterEntry>> {
    const userEntries = this.entries.get(uid) ?? new Map();

    const entries = new Map<string, BucketRateLimiterEntry>();
    for (const bucket of buckets) {
      const entry = userEntries.get(bucket);
      if (entry !== undefined) entries.set(bucket, entry);
    }

    return entries;
  }

  async writeEntries(uid: string, tokens: Map<string, number>): Promise<void> {
    // Make a copy of the existing entries for that user.
    const userEntries = new Map(this.entries.get(uid)) ?? new Map();

    for (const [bucket, value] of tokens) {
      userEntries.set(
        bucket,
        new BucketRateLimiterEntry(uid, bucket, value, new Date())
      );
    }
    this.entries.set(uid, userEntries);
  }
}
