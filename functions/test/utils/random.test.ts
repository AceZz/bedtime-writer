import {
  afterAll,
  beforeAll,
  describe,
  expect,
  jest,
  test,
} from "@jest/globals";
import { getRandomInt, shuffleArray } from "../../src/utils";

describe("shuffleArray", () => {
  beforeAll(() => {
    // This makes the Fisher-Yates algorithm always select the last item in the
    // sublist to swap with the current item.
    jest.spyOn(Math, "random").mockReturnValue(0.999);
  });

  afterAll(() => {
    jest.spyOn(Math, "random").mockRestore();
  });

  test("empty", () => {
    const items: number[] = [];
    shuffleArray(items);
    expect(items).toEqual([]);
  });

  test.only("with items", () => {
    const items = [9, 3, 6, 1, 0];
    shuffleArray(items);
    expect(items).toEqual([0, 9, 3, 6, 1]);
  });
});

describe("getRandomInt", () => {
  test("lower bound", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.3);
    expect(getRandomInt(1, 3)).toBe(1);
    jest.spyOn(Math, "random").mockRestore();
  });

  test("higher bound", () => {
    // Math.random is always < 1.
    jest.spyOn(Math, "random").mockReturnValue(0.999);
    expect(getRandomInt(1, 3)).toBe(2);
    jest.spyOn(Math, "random").mockRestore();
  });
});
