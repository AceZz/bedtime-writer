import { readFile } from "fs/promises";

import { describe, expect, test } from "@jest/globals";

import { StoryChoice, StoryQuestion } from "../../../src/story";
import { QUESTIONS_0 } from "../data";

describe("StoryQuestion", () => {
  test("constructor", async () => {
    const image = await readFile("test/story/data/choice.jpg");

    new StoryQuestion(
      "toBeOrNotV1",
      "toBeOrNot",
      "To be or not to be?",
      0,
      new Date(),
      [
        new StoryChoice("yes", "Yes", "Yes to be.", image),
        new StoryChoice("no", "No", "No not be.", image),
      ]
    );
  });

  test("copyWithChoices", async () => {
    const questions = await QUESTIONS_0();

    const copy = questions[0].copyWithChoices(["choice1"]);
    expect(Array.from(copy.choices.keys())).toEqual(["choice1"]);
  });

  test("copyWithChoicesThrows", async () => {
    const questions = await QUESTIONS_0();

    expect(() => questions[0].copyWithChoices(["doesnotexist"])).toThrow();
  });
});
