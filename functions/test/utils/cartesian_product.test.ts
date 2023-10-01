import { describe, expect, test } from "@jest/globals";
import {
  cartesianProduct,
  ithCartesianProduct,
  numCartesianProduct,
  sampleCartesianProduct,
} from "../../src/utils";

describe("sampleCartesianProduct", () => {
  const input = [
    ["a", "b"],
    ["c", "d"],
  ];

  test("throws on num < 0", () => {
    expect(() => Array.from(sampleCartesianProduct(-1, input))).toThrow();
  });

  test("num = 0", () => {
    const sampled = Array.from(sampleCartesianProduct(0, input));
    expect(sampled).toEqual([]);
  });

  test("num = undefined", () => {
    const sampled = Array.from(sampleCartesianProduct(undefined, input));
    expect(sampled.length).toBe(4);
  });

  test("0 < num < maxCombinations", () => {
    const sampled = Array.from(sampleCartesianProduct(3, input));
    expect(sampled.length).toBe(3);
  });

  test("num > maxCombinations", () => {
    const sampled = Array.from(sampleCartesianProduct(10, input));
    expect(sampled.length).toBe(4);
  });
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
