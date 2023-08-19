import { describe, expect, jest, test } from "@jest/globals";
import {
  compressToPng,
  promiseTimeout,
  sleep,
  retryAsyncFunction,
  cartesianProduct,
  listToMapById,
  ithCartesianProduct,
  numCartesianProduct,
} from "../../src/utils";
import { FAKE_IMAGE_BYTES } from "../../src/story";

test("compressToPng", async () => {
  await compressToPng(FAKE_IMAGE_BYTES, {});
});

describe("ithCartesianProduct", () => {
  test("i < 0 throws", () => {
    const input = [
      ["a", "b"],
      ["c", "d"],
    ];

    expect(() => ithCartesianProduct(-1, input)).toThrow();
  });

  test("i > max index throws", () => {
    const input = [
      ["a", "b"],
      ["c", "d"],
    ];

    expect(() => ithCartesianProduct(4, input)).toThrow();
  });

  test("Return the ith cartesian product, two arrays", () => {
    const input = [
      ["a", "b"],
      ["c", "d"],
    ];

    expect(ithCartesianProduct(0, input).join("")).toBe("ac");
    expect(ithCartesianProduct(2, input).join("")).toBe("bc");
  });

  test("Return the ith cartesian product, six arrays", () => {
    const input = [
      ["a", "b", "c", "d"],
      ["a", "b", "c", "d"],
      ["a", "b", "c", "d"],
      ["a", "b", "c", "d"],
      ["a", "b", "c", "d"],
      ["a", "b", "c", "d"],
    ];

    expect(ithCartesianProduct(0, input).join("")).toBe("aaaaaa");
    expect(ithCartesianProduct(1024, input).join("")).toBe("baaaaa");
    expect(() => ithCartesianProduct(4096, input)).toThrow();
  });
});

describe("cartesianProduct", () => {
  test("Returns the cartesian product", () => {
    const input = [
      ["A", "B"],
      ["Y", "X"],
    ];
    const expected = [
      ["A", "Y"],
      ["A", "X"],
      ["B", "Y"],
      ["B", "X"],
    ];

    const actual = Array.from(cartesianProduct(input));

    expect(actual).toEqual(expected);
  });

  test("Throws on empty input", () => {
    const input = [[], ["a"]];
    expect(() => Array.from(cartesianProduct(input))).toThrow();

    const input2 = [["a"], []];
    expect(() => Array.from(cartesianProduct(input2))).toThrow();
  });
});

describe("numCartesianProduct", () => {
  test("Returns the number of items in the cartesian product", () => {
    const input = [
      ["a", "b"],
      ["c", "d"],
    ];
    expect(numCartesianProduct(input)).toBe(4);
  });

  test("Throws on empty input", () => {
    expect(() => numCartesianProduct([[], [1]])).toThrow();
    expect(() => numCartesianProduct([[1], []])).toThrow();
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
