import { expect, test } from "@jest/globals";

import { getPrompt, getStoryTitle } from "../../../src/story/generator/utils";
import { FULL_PARAMS, PARTIAL_PARAMS } from "./data";

test("getStoryTitle with no params", () => {
  expect(getStoryTitle({})).toBe("Tonight's story");
});

test("getStoryTitle with full params", () => {
  expect(getStoryTitle(FULL_PARAMS)).toBe("The story of Someone");
});

test("getPrompt with partial params", () => {
  expect(getPrompt(PARTIAL_PARAMS)).toBe(
    "Write a fairy tale. " +
      "The protagonist is Someone. " +
      "It has a flaw. " +
      "The story happens at some place."
  );
});

test("getPrompt with full params", () => {
  expect(getPrompt(FULL_PARAMS)).toBe(
    "Write a fairy tale in the style of some style. " +
      "The protagonist is Someone. " +
      "It has a flaw. " +
      "It has a power. " +
      "It is challenged with being challenged. " +
      "The story happens at some place. " +
      "The protagonist finds some object in the journey. " +
      "The length is about 300 words."
  );
});
