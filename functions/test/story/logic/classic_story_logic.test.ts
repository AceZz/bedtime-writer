import { describe, expect, test } from "@jest/globals";

import { PARTIAL_CLASSIC_STORY_LOGIC, FULL_CLASSIC_STORY_LOGIC } from "./data";
import { ClassicStoryLogic } from "../../../src/story";

describe("ClassicStoryLogic", () => {
  test("copyWith", () => {
    expect(
      PARTIAL_CLASSIC_STORY_LOGIC.copyWith({
        place: "another place",
        object: "some object",
        characterFlaw: undefined, // Not replaced!
      })
    ).toStrictEqual(
      new ClassicStoryLogic(
        3,
        "some style",
        "Someone",
        "another place",
        "some object",
        "has a flaw"
      )
    );
  });

  test.each([PARTIAL_CLASSIC_STORY_LOGIC, FULL_CLASSIC_STORY_LOGIC])(
    "isValid",
    (logic) => {
      expect(logic.isValid()).toBe(true);
    }
  );

  test("isValid with out of bounds duration", () => {
    const logic = new ClassicStoryLogic(11, "some style", "Someone");
    expect(logic.isValid()).not.toBe(true);
  });

  test.each([
    "style",
    "characterName",
    "place",
    "object",
    "characterFlaw",
    "characterPower",
    "characterChallenge",
  ])("isValid with out of bounds string", (stringKey) => {
    const logic = PARTIAL_CLASSIC_STORY_LOGIC.copyWith({
      [stringKey]: "x".repeat(51),
    });
    expect(logic.isValid()).not.toBe(true);
  });

  test("titlePrompt of partial", () => {
    expect(PARTIAL_CLASSIC_STORY_LOGIC.titlePrompt()).not.toBe("");
  });

  test("titlePrompt of full", () => {
    expect(FULL_CLASSIC_STORY_LOGIC.titlePrompt()).not.toBe("");
  });

  test("prompt of partial", () => {
    expect(PARTIAL_CLASSIC_STORY_LOGIC.prompt()).toBe(
      "Write a fairy tale in the style of some style. " +
        "The protagonist is Someone. " +
        "The protagonist has a flaw. " +
        "The story takes place at some place. " +
        "The length is about 300 words."
    );
  });

  test("prompt of full", () => {
    expect(FULL_CLASSIC_STORY_LOGIC.prompt()).toBe(
      "Write a fairy tale in the style of some style. " +
        "The protagonist is Someone. " +
        "The protagonist has a flaw. " +
        "The protagonist has a power. " +
        "The protagonist is challenged with being challenged. " +
        "The story takes place at some place. " +
        "The protagonist finds some object in the journey. " +
        "The length is about 300 words."
    );
  });

  test("prompt of partial", () => {
    expect(PARTIAL_CLASSIC_STORY_LOGIC.imagePromptPrompt()).toBe(
      "Generate now a very simple and concise prompt for dalle" +
        " to illustrate Someone of the story and its environment." +
        " When mentioning Someone, provide a short but accurate appearance description." +
        " Someone should be either beautiful or cute." +
        " You must mention a fairytale digital painting style."
    );
  });

  test("prompt of FULL", () => {
    expect(FULL_CLASSIC_STORY_LOGIC.imagePromptPrompt()).toBe(
      "Generate now a very simple and concise prompt for dalle" +
        " to illustrate Someone of the story and its environment." +
        " When mentioning Someone, provide a short but accurate appearance description." +
        " Someone should be either beautiful or cute." +
        " You must mention a fairytale digital painting style."
    );
  });

  test("toString", () => {
    expect(FULL_CLASSIC_STORY_LOGIC.toString().toLowerCase()).toContain(
      "someone"
    );
  });
});
