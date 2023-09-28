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
        "Frosty, the penguin",
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
    expect(PARTIAL_CLASSIC_STORY_LOGIC.prompt()).toContain(
      "Frosty, the penguin"
    );
    expect(PARTIAL_CLASSIC_STORY_LOGIC.prompt()).toContain("at some place");
    expect(PARTIAL_CLASSIC_STORY_LOGIC.prompt()).toContain("has a flaw");
  });

  test("prompt of full", () => {
    expect(FULL_CLASSIC_STORY_LOGIC.prompt()).toContain("some style");
    expect(FULL_CLASSIC_STORY_LOGIC.prompt()).toContain("Frosty, the penguin");
    expect(FULL_CLASSIC_STORY_LOGIC.prompt()).toContain("at some place");
    expect(FULL_CLASSIC_STORY_LOGIC.prompt()).toContain("some object");
    expect(FULL_CLASSIC_STORY_LOGIC.prompt()).toContain("has a flaw");
    expect(FULL_CLASSIC_STORY_LOGIC.prompt()).toContain("has a power");
    expect(FULL_CLASSIC_STORY_LOGIC.prompt()).toContain(
      "is challenged with being challenged"
    );
  });

  test("imagePromptPrompt of partial", () => {
    expect(PARTIAL_CLASSIC_STORY_LOGIC.imagePromptPrompt()).toContain(
      "Frosty, the penguin"
    );
    expect(PARTIAL_CLASSIC_STORY_LOGIC.imagePromptPrompt()).toContain("prompt");
  });

  test("imagePromptPrompt of FULL", () => {
    expect(FULL_CLASSIC_STORY_LOGIC.imagePromptPrompt()).toContain(
      "Frosty, the penguin"
    );
    expect(FULL_CLASSIC_STORY_LOGIC.imagePromptPrompt()).toContain("prompt");
  });

  test("toString", () => {
    expect(FULL_CLASSIC_STORY_LOGIC.toString()).toContain(
      "Frosty, the penguin"
    );
  });
});
