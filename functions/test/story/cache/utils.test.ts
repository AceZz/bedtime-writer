import { test, expect } from "@jest/globals";
import { cartesianProduct } from "../../../src/story/cache/utils";

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
