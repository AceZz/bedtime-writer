import { describe, expect, jest, test } from "@jest/globals";
import {
  compressToPng,
  promiseTimeout,
  sleep,
  retryAsyncFunction,
  cartesianProduct,
} from "../src/utils";
import { FAKE_IMAGE_BYTES } from "../src/story/generator/image_api/fake_image_api";

test("compressToPng", async () => {
  await compressToPng(FAKE_IMAGE_BYTES, {});
});

test("Should return the cartesian product", () => {
  const input = [
    ["a", "b"],
    ["c", "d"],
  ];
  const expected = [
    ["a", "c"],
    ["a", "d"],
    ["b", "c"],
    ["b", "d"],
  ];

  const actual = cartesianProduct(input);

  expect(actual.sort()).toEqual(expected.sort());
});

test("Should throw an error about the cartesian product", () => {
  const input = [[], ["a"]];
  expect(() => cartesianProduct(input)).toThrow();
});

test("sleep for the specified duration", async () => {
  const sleepDuration = 300;

  const before = Date.now();
  await sleep(sleepDuration);
  const after = Date.now();
  const duration = after - before;

  const errorMargin = 100;
  expect(duration).toBeGreaterThanOrEqual(sleepDuration);
  expect(duration).toBeLessThanOrEqual(sleepDuration + errorMargin);
});

describe("promiseTimeout function", () => {
  test("resolves the promise before the timeout", async () => {
    const promiseDelay = 200;
    const timeout = 300;
    const promise = new Promise<string>((resolve) => {
      setTimeout(() => resolve("resolved"), promiseDelay);
    });

    const result = promiseTimeout(promise, timeout);

    await expect(result).resolves.toBe("resolved");
  });

  test("rejects the promise after the timeout", async () => {
    const promiseDelay = 300;
    const timeout = 200;
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
    const params = {
      maxTries: 3,
      timeout: 100,
      delay: 100,
    };

    const { result: awaited, tries: tries } = await retryAsyncFunction(
      mockFn,
      params
    );

    expect(awaited).toBe("success");
    expect(tries).toBe(1);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  test("should succeed if the function fails on the first attempt but succeeds on retry", async () => {
    const mockFn = jest
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error("failed"))
      .mockResolvedValueOnce("success");
    const params = {
      maxTries: 2,
      timeout: 100,
      delay: 100,
    };

    const { result, tries: tries } = await retryAsyncFunction(mockFn, params);

    expect(result).toBe("success");
    expect(tries).toBe(2);
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  test("should throw an error if the function fails on all attempts", async () => {
    const mockFn = jest
      .fn<() => Promise<string>>()
      .mockRejectedValue(new Error("failed"));
    const params = {
      maxTries: 3,
      timeout: 100,
      delay: 100,
    };

    await expect(retryAsyncFunction(mockFn, params)).rejects.toThrow();
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  test("should apply delayIterator function correctly", async () => {
    const mockFn = jest
      .fn<() => Promise<string>>()
      .mockRejectedValue(new Error("Test error"));

    const maxTries = 4;
    const timeout = 0;
    const delay = 100;
    const delayIterator = (x: number) => 2 * x;
    const params = {
      maxTries: maxTries,
      timeout: timeout,
      delay: delay,
      delayIterator: delayIterator,
    };

    const before = Date.now();
    try {
      await retryAsyncFunction(mockFn, params);
    } catch (e) {
      // We expect an error, since the mock function always throws one
    }
    const after = Date.now();
    const duration = after - before;

    const expectedDuration =
      delay + delayIterator(delay) + delayIterator(delayIterator(delay));
    const errorMargin = 100;
    expect(duration).toBeGreaterThanOrEqual(expectedDuration);
    expect(duration).toBeLessThanOrEqual(expectedDuration + errorMargin);
  });
});
