import { describe, expect, test } from "@jest/globals";
import {
  combinationsIndices,
  combinations,
  numCombinations,
  sampleCombinations,
  ithCombination,
} from "../../src/utils";

const [a, b, c, d] = [1, 2, 3, 4];

describe("sampleCombinations", () => {
  test("throws on num < 0", () => {
    expect(() => Array.from(sampleCombinations(-1, 3, [a, b, c]))).toThrow();
  });

  test("num = 0", () => {
    const sampled = Array.from(sampleCombinations(0, 2, [a, b, c, d]));
    expect(sampled).toEqual([]);
  });

  test("num = undefined", () => {
    const sampled = Array.from(sampleCombinations(undefined, 2, [a, b, c, d]));
    expect(sampled.length).toBe(6);
  });

  test("0 < num < maxCombinations", () => {
    const sampled = Array.from(sampleCombinations(3, 2, [a, b, c, d]));
    expect(sampled.length).toBe(3);
  });

  test("num > maxCombinations", () => {
    const sampled = Array.from(sampleCombinations(10, 2, [a, b, c, d]));
    expect(sampled.length).toBe(6);
  });
});

describe("ithCombination", () => {
  test("throws on i < 0", () => {
    expect(() => Array.from(ithCombination(-1, 2, [a, b, c]))).toThrow();
  });

  test("throws on i > combinations length", () => {
    expect(() => Array.from(ithCombination(10, 2, [a, b, c, d]))).toThrow();
  });

  test("k = 1", () => {
    expect(Array.from(ithCombination(0, 1, [a, b, c, d]))).toEqual([a]);
    expect(Array.from(ithCombination(2, 1, [a, b, c, d]))).toEqual([c]);
  });

  test("k = 2", () => {
    expect(Array.from(ithCombination(0, 2, [a, b, c, d]))).toEqual([a, b]);
    expect(Array.from(ithCombination(5, 2, [a, b, c, d]))).toEqual([c, d]);
  });
});

describe("combinations", () => {
  test("throws on k < 0", () => {
    expect(() => Array.from(combinations(-1, [a, b, c]))).toThrow();
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

describe("numCombinations", () => {
  test("throws on k < 0", () => {
    expect(() => numCombinations(-1, 5)).toThrow();
  });

  test("throws on k > items length", () => {
    expect(() => numCombinations(2, 0)).toThrow();
    expect(() => numCombinations(5, 3)).toThrow();
  });

  test("k = 0", () => {
    expect(numCombinations(0, 1)).toBe(1);
    expect(numCombinations(0, 3)).toBe(1);
  });

  test("k = 1", () => {
    expect(numCombinations(1, 4)).toBe(4);
  });

  test("k = 2", () => {
    expect(numCombinations(2, 4)).toBe(6);
  });
});
