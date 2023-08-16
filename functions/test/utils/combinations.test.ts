import { describe, expect, test } from "@jest/globals";
import { combinationsIndices, combinations } from "../../src/utils";

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
