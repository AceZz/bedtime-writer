/**
 * Limits the rate at which some operations can be performed.
 *
 * Operations are identified by a string key.
 */
export interface RateLimiter {
  /**
   * Record new requests and throw if at least one limit is reached.
   *
   * @param uid The user ID.
   * @param operations The names of the performed operations.
   * @throws `RateLimiterError` If at least one limit is reached.
   */
  addRequests(uid: string, operations: string[]): Promise<void>;
}

export class RateLimiterError extends Error {
  constructor(readonly operations: string[], readonly uid?: string) {
    let message = "";
    if (uid === undefined) {
      message = `Rate-limited: ${operations.join(", ")}`;
    } else {
      message = `User ${uid} was rate-limited: ${operations.join(", ")}`;
    }

    super(message);
    this.name = "RateLimiterError";
  }
}
