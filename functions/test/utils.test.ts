import { describe, expect, jest, test } from "@jest/globals";
import {
  compressToPng,
  promiseTimeout,
  sleep,
  retryAsyncFunction,
  cartesianProduct,
  listToMapById,
  combinationsIndices,
  combinations,
} from "../src/utils";
import { FAKE_IMAGE_BYTES } from "../src/story";

test("compressToPng", async () => {
  await compressToPng(FAKE_IMAGE_BYTES, {});
});

describe("cartesianProduct", () => {
  test("Returns the cartesian product", () => {
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

  test("Throws on empty input", () => {
    const input = [[], ["a"]];
    expect(() => cartesianProduct(input)).toThrow();
  });
});

describe("combinations", () => {
  const [a, b, c, d] = [1, 2, 3, 4];

  test("throws on k < 0", () => {
    expect(() => Array.from(combinations(-1, [a, b, 3]))).toThrow();
  });

  test("throws on k > items length", () => {
    expect(() => Array.from(combinations(2, []))).toThrow();
    expect(() => Array.from(combinations(5, [a, b, c]))).toThrow();
  });

  test("k = 0", () => {
    expect(Array.from(combinations(0, []))).toEqual([[]]);
    expect(Array.from(combinations(0, [a, b, c]))).toEqual([[]]);
  });

  test("k = 1", () => {
    expect(Array.from(combinations(1, [a, b, c, d]))).toEqual([
      [a],
      [b],
      [c],
      [d],
    ]);
  });

  test("k = 2", () => {
    expect(Array.from(combinations(2, [a, b, c, d]))).toEqual([
      [a, b],
      [a, c],
      [a, d],
      [b, c],
      [b, d],
      [c, d],
    ]);
  });

  test("duplicates", () => {
    expect(Array.from(combinations(2, [a, b, b, b]))).toEqual([
      [a, b],
      [a, b],
      [a, b],
      [b, b],
      [b, b],
      [b, b],
    ]);
  });
});

describe("combinationIndices", () => {
  test("throws on k < 0", () => {
    expect(() => Array.from(combinationsIndices(-3, 4))).toThrow();
  });

  test("throws on k > n", () => {
    expect(() => Array.from(combinationsIndices(3, 2))).toThrow();
  });

  test("k = 0", () => {
    const indices = Array.from(combinationsIndices(0, 4));

    expect(indices).toEqual([[]]);
  });

  test("k = 1", () => {
    const indices = Array.from(combinationsIndices(1, 4));

    expect(indices).toEqual([[0], [1], [2], [3]]);
  });

  test("k = 2, n = 4", () => {
    const indices = Array.from(combinationsIndices(2, 4));

    expect(indices).toEqual([
      [0, 1],
      [0, 2],
      [0, 3],
      [1, 2],
      [1, 3],
      [2, 3],
    ]);
  });
});

test("sleep for the specified duration", async () => {
  const sleepDuration = 300;

  const before = Date.now();
  await sleep(sleepDuration);
  const after = Date.now();
  const duration = after - before;

  const errorMargin = 100;
  expect(duration).toBeGreaterThanOrEqual(sleepDuration - errorMargin);
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

test("listToMapById", () => {
  const data = [
    { id: 1, x: 3 },
    { id: 3, y: 4 },
    { id: 2, z: 5 },
  ];

  const expected = new Map();
  expected.set(data[0].id, data[0]);
  expected.set(data[1].id, data[1]);
  expected.set(data[2].id, data[2]);

  expect(listToMapById(data)).toEqual(expected);
});
