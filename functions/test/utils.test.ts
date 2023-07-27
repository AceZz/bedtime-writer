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
  const errorMargin = 500;
  const before = Date.now();
  await sleep(sleepDuration);
  const after = Date.now();
  const duration = after - before;
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

    const result = await retryAsyncFunction(mockFn);

    expect(result).toBe("success");
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  test("should succeed if the function fails on the first attempt but succeeds on retry", async () => {
    const retries = 2;
    const mockFn = jest
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error("failed"))
      .mockResolvedValueOnce("success");

    const result = await retryAsyncFunction(mockFn, retries);

    expect(result).toBe("success");
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  test("should throw an error if the function fails on all attempts", async () => {
    const retries = 2;
    const delay = 1000;
    const mockFn = jest
      .fn<() => Promise<string>>()
      .mockRejectedValue(new Error("failed"));

    await expect(retryAsyncFunction(mockFn, retries, delay)).rejects.toThrow(
      "failed"
    );
    expect(mockFn).toHaveBeenCalledTimes(3);
  });
});
