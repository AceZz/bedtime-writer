import { describe, expect, jest, test } from "@jest/globals";
import {
  compressToPng,
  promiseTimeout,
  sleep,
  retryAsyncFunction,
} from "../src/utils";
import { FAKE_IMAGE_BYTES } from "../src/story/generator/image_api/fake_image_api";

test("compressToPng", async () => {
  await compressToPng(FAKE_IMAGE_BYTES, {});
});

test("sleep for the specified duration", async () => {
  const sleepDuration = 1000;

  const before = Date.now();
  await sleep(sleepDuration);
  const after = Date.now();
  const duration = after - before;

  const errorMargin = 200;
  expect(duration).toBeGreaterThanOrEqual(sleepDuration);
  expect(duration).toBeLessThanOrEqual(sleepDuration + errorMargin);
});

describe("promiseTimeout function", () => {
  test("resolves the promise before the timeout", async () => {
    const promiseDelay = 500;
    const timeout = 1000;
    const promise = new Promise<string>((resolve) => {
      setTimeout(() => resolve("resolved"), promiseDelay);
    });

    const result = promiseTimeout(promise, timeout);

    await expect(result).resolves.toBe("resolved");
  });

  test("rejects the promise after the timeout", async () => {
    const promiseDelay = 1500;
    const timeout = 1000;
    const promise = new Promise<string>((resolve) => {
      setTimeout(() => resolve("resolved"), promiseDelay);
    });

    const result = promiseTimeout(promise, timeout);

    await expect(result).rejects.toBe(
      `promiseTimeout: Promise timed out after ${timeout} ms`
    );
  });
});

describe("retryAsyncFunction", () => {
  test("should succeed if the function succeeds on the first attempt", async () => {
    const mockFn = jest.fn(() => Promise.resolve("success"));

    const { awaited, retries } = await retryAsyncFunction(mockFn);

    expect(awaited).toBe("success");
    expect(retries).toBe(0);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  test("should succeed if the function fails on the first attempt but succeeds on retry", async () => {
    const maxRetries = 2;
    const mockFn = jest
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error("failed"))
      .mockResolvedValueOnce("success");

    const { awaited, retries } = await retryAsyncFunction(mockFn, maxRetries);

    expect(awaited).toBe("success");
    expect(retries).toBe(1);
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  test("should throw an error if the function fails on all attempts", async () => {
    const maxRetries = 2;
    const delay = 1000;
    const mockFn = jest
      .fn<() => Promise<string>>()
      .mockRejectedValue(new Error("failed"));

    await expect(
      retryAsyncFunction(mockFn, maxRetries, undefined, delay)
    ).rejects.toThrow();
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  test("should apply delayIterator function correctly", async () => {
    const mockFn = jest
      .fn<() => Promise<string>>()
      .mockRejectedValue(new Error("Test error"));

    const maxRetries = 3;
    const timeout = 0;
    const delay = 500;
    const delayIterator = (x: number) => 2 * x;

    const before = Date.now();
    try {
      await retryAsyncFunction(
        mockFn,
        maxRetries,
        timeout,
        delay,
        delayIterator
      );
    } catch (e) {
      // We expect an error, since the mock function always throws one
    }
    const after = Date.now();
    const duration = after - before;

    const expectedDuration =
      delay + delayIterator(delay) + delayIterator(delayIterator(delay));
    const errorMargin = 200;
    expect(duration).toBeGreaterThanOrEqual(expectedDuration);
    expect(duration).toBeLessThanOrEqual(expectedDuration + errorMargin);
  });
});
