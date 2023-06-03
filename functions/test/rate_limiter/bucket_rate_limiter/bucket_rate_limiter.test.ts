import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import {
  BucketRateLimiter,
  RateLimiter,
  RateLimiterError,
} from "../../../src/rate_limiter";
import { FakeBucketRateLimiterStorage } from "./fake_bucket_rate_limiter_storage";
import { BucketRateLimiterEntry } from "../../../src/rate_limiter/bucket_rate_limiter/bucket_rate_limiter_storage";

const MAX_TOKENS = new Map([
  ["classic", 10],
  ["adventure", 1],
]);

const REFILL_TIME = new Map([
  ["classic", 3600 * 24],
  ["adventure", 3600 * 24],
]);

const START_DATE = new Date(2020, 0, 1, 0, 0, 0, 0);
const START_DATE_PLUS_6_HOURS = new Date(2020, 0, 1, 6, 0, 0, 0);
const START_DATE_PLUS_ONE_YEAR = new Date(2021, 0, 1, 0, 0, 0, 0);

describe("BucketRateLimiter with fake storage", () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: START_DATE });
  });

  function initRateLimiter(): {
    storage: FakeBucketRateLimiterStorage;
    limiter: RateLimiter;
  } {
    const entries = new Map([
      [
        "user1",
        new Map([
          [
            "classic",
            new BucketRateLimiterEntry("user1", "classic", 3, new Date()),
          ],
          [
            "adventure",
            new BucketRateLimiterEntry("user1", "adventure", 1, new Date()),
          ],
        ]),
      ],
    ]);
    const storage = new FakeBucketRateLimiterStorage(entries);
    const limiter = new BucketRateLimiter(storage, MAX_TOKENS, REFILL_TIME);

    return { storage, limiter };
  }

  function getTokens(
    storage: FakeBucketRateLimiterStorage,
    uid: string,
    bucket: string
  ) {
    return storage.entries.get(uid)?.get(bucket)?.tokens;
  }

  test("with inconsistent input data", () => {
    expect(
      () =>
        new BucketRateLimiter(
          new FakeBucketRateLimiterStorage(new Map()),
          new Map([["classic", 10]]),
          new Map([["adventure", 3600 * 24]])
        )
    ).toThrow();
  });

  test("loadStorage", () => {
    const { storage } = initRateLimiter();
    expect(getTokens(storage, "user1", "classic")).toBe(3);
    expect(getTokens(storage, "user1", "adventure")).toBe(1);
  });

  test("can add requests", async () => {
    const { storage, limiter } = initRateLimiter();

    await limiter.addRequests("user1", ["classic", "adventure"]);
    expect(getTokens(storage, "user1", "classic")).toBe(2);
    expect(getTokens(storage, "user1", "adventure")).toBe(0);

    await limiter.addRequests("user1", ["classic"]);
    expect(getTokens(storage, "user1", "classic")).toBe(1);
    expect(getTokens(storage, "user1", "adventure")).toBe(0);
  });

  test("cannot add exhausted requests", async () => {
    const { limiter, storage } = initRateLimiter();

    await limiter.addRequests("user1", ["classic", "adventure"]);
    expect(getTokens(storage, "user1", "classic")).toBe(2);
    expect(getTokens(storage, "user1", "adventure")).toBe(0);

    await expect(() =>
      limiter.addRequests("user1", ["classic", "adventure"])
    ).rejects.toThrow(new RateLimiterError(["adventure"], "user1"));

    // NO request was added.
    expect(getTokens(storage, "user1", "classic")).toBe(2);
    expect(getTokens(storage, "user1", "adventure")).toBe(0);
  });

  test("refill is capped by max", async () => {
    const { limiter, storage } = initRateLimiter();
    expect(getTokens(storage, "user1", "adventure")).toBe(
      MAX_TOKENS.get("adventure")
    );

    // Change the date and trigger a refill.
    jest.setSystemTime(START_DATE_PLUS_ONE_YEAR);
    await limiter.addRequests("user1", []);

    // Still at maximum.
    expect(getTokens(storage, "user1", "adventure")).toBe(
      MAX_TOKENS.get("adventure")
    );
  });

  test("refill calculation", async () => {
    const { limiter, storage } = initRateLimiter();
    expect(getTokens(storage, "user1", "classic")).toBe(3);

    // Change the date and trigger a refill.
    jest.setSystemTime(START_DATE_PLUS_6_HOURS);
    await limiter.addRequests("user1", []);

    // 6 hours = 25 % of maximum = 25 % of 10
    expect(getTokens(storage, "user1", "classic")).toBe(5.5);
  });

  test("can add requests after refill", async () => {
    const { limiter, storage } = initRateLimiter();

    await limiter.addRequests("user1", ["classic"]);
    await limiter.addRequests("user1", ["classic"]);
    await limiter.addRequests("user1", ["classic"]);
    expect(getTokens(storage, "user1", "classic")).toBe(0);

    // Cannot add requests.
    await expect(() =>
      limiter.addRequests("user1", ["classic"])
    ).rejects.toThrow(new RateLimiterError(["classic"], "user1"));
    expect(getTokens(storage, "user1", "classic")).toBe(0);

    // Change the date.
    jest.setSystemTime(START_DATE_PLUS_ONE_YEAR);

    // Can add requests.
    await limiter.addRequests("user1", ["classic"]);
    expect(getTokens(storage, "user1", "classic")).toBe(9);
  });

  test("new user starts with all tokens", async () => {
    const { limiter, storage } = initRateLimiter();

    await limiter.addRequests("new_user", ["classic"]);
    await limiter.addRequests("new_user", ["classic"]);
    await limiter.addRequests("new_user", ["classic"]);
    await limiter.addRequests("new_user", ["adventure"]);
    expect(getTokens(storage, "new_user", "classic")).toBe(7);
    expect(getTokens(storage, "new_user", "adventure")).toBe(0);
  });

  test("new user spends and refills", async () => {
    const { limiter, storage } = initRateLimiter();

    await limiter.addRequests("new_user", ["classic"]);
    await limiter.addRequests("new_user", ["classic"]);
    await limiter.addRequests("new_user", ["classic"]);
    await limiter.addRequests("new_user", ["classic"]);
    await limiter.addRequests("new_user", ["classic"]);
    expect(getTokens(storage, "new_user", "classic")).toBe(5);

    // Change the date and trigger a refill.
    jest.setSystemTime(START_DATE_PLUS_6_HOURS);
    await limiter.addRequests("new_user", []);

    expect(getTokens(storage, "new_user", "classic")).toBe(7.5);
  });
});
