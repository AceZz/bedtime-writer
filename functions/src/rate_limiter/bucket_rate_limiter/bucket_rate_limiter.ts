import { setsAreEqual } from "../../utils";
import { RateLimiterError, RateLimiter } from "../rate_limiter";
import {
  BucketRateLimiterEntry,
  BucketRateLimiterStorage,
} from "./bucket_rate_limiter_storage";

/**
 * Implementation of a `RateLimiter` with the token bucket algorithm.
 *
 * @param storage Deals with data storage.
 * @param maxTokens Maps the bucket name to the maximum number of tokens that
 *     are allowed.
 * @param refillTime Maps the bucket name to the number of seconds it takes to
 *      refill one token.
 */
export class BucketRateLimiter implements RateLimiter {
  private buckets: string[];
  private maxTokens: Map<string, number>;
  private refillTimes: Map<string, number>;

  constructor(
    readonly storage: BucketRateLimiterStorage,
    maxTokens: Map<string, number>,
    refillTimes: Map<string, number>
  ) {
    if (!setsAreEqual(new Set(maxTokens.keys()), new Set(refillTimes.keys()))) {
      throw Error("BucketRateLimiter: inconsistent keys provided");
    }

    this.maxTokens = maxTokens;
    this.refillTimes = refillTimes;
    this.buckets = [...maxTokens.keys()];
  }

  async addRequests(uid: string, operations: string[]): Promise<void> {
    const tokens = new Map();
    for (const operation of operations) {
      tokens.set(operation, 1);
    }
    return this.spendTokens(uid, tokens);
  }

  /**
   * Implementation of the token bucket algorithm:
   *   1. Tokens are refilled, based on the time difference between now and the
   *      last update.
   *   2. The number of tokens is computed depending on the number of tokens
   *      spent.
   *   3. If the number of tokens is not sufficient, an error is thrown.
   */
  private async spendTokens(
    uid: string,
    tokens: Map<string, number>
  ): Promise<void> {
    await this.refillTokens(uid);

    const { remainingTokens, missingTokens } =
      await this.getTokensAfterSpending(uid, tokens);

    if (missingTokens.size > 0) {
      throw new RateLimiterError([...missingTokens.keys()], uid);
    }
    await this.storage.writeEntries(uid, remainingTokens);
  }

  private async refillTokens(uid: string): Promise<void> {
    const entries = await this.storage.readEntries(uid, this.buckets);

    const newTokens = new Map();
    for (const bucket of this.buckets) {
      const max = this.maxTokens.get(bucket) ?? 0;
      const refillTime = this.refillTimes.get(bucket) ?? 1;

      const entry = entries.get(bucket);
      if (entry === undefined) {
        newTokens.set(bucket, max);
      } else {
        const tokensAfterRefill = this.getTokensAfterRefill(
          entry,
          max,
          refillTime
        );
        newTokens.set(bucket, tokensAfterRefill);
      }
    }

    await this.storage.writeEntries(uid, newTokens);
  }

  private getTokensAfterRefill(
    entry: BucketRateLimiterEntry,
    maxTokens: number,
    refillTime: number
  ): number {
    const deltaMillis = Date.now() - entry.lastUpdated.getTime();
    const deltaSeconds = deltaMillis / 1000;
    const percentRefilled = Math.max(0, Math.min(1, deltaSeconds / refillTime));

    return Math.min(maxTokens, percentRefilled * maxTokens + entry.tokens);
  }

  private async getTokensAfterSpending(
    uid: string,
    tokensToSpend: Map<string, number>
  ): Promise<{
    remainingTokens: Map<string, number>;
    missingTokens: Map<string, number>;
  }> {
    // Map the bucket name to the number of tokens after the operation.
    const remainingTokens = new Map();
    // Map the bucket name to the number of tokens missing to perform the
    // operation.
    const missingTokens = new Map();

    const currentEntries = await this.storage.readEntries(uid, this.buckets);
    for (const [bucket, tokens] of tokensToSpend) {
      const currentTokens = currentEntries.get(bucket)?.tokens ?? 0;
      const remaining = currentTokens - tokens;

      if (remaining >= 0) {
        remainingTokens.set(bucket, remaining);
      } else {
        // Make it positive.
        missingTokens.set(bucket, -1 * remaining);
      }
    }

    return { remainingTokens, missingTokens };
  }
}
