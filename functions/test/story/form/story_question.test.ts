import { readFile } from "fs/promises";

import { describe, expect, test } from "@jest/globals";

import { StoryChoice, StoryQuestion } from "../../../src/story";
import { DUMMY_QUESTIONS, DUMMY_QUESTIONS_0 } from "../data";

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

  test("toString", () => {
    const questions = DUMMY_QUESTIONS;

    expect(questions[0].toString()).toBe(
      `
Question 1 (question1V1)
  * Text for choice1
  * Text for choice2
  * Text for choice3
`.trim()
    );
  });

  test("fullId", () => {
    const questions = DUMMY_QUESTIONS;
    expect(questions[0].fullId()).toBe("question1V1:choice1,choice2,choice3");
  });

  test("copyWithChoices", () => {
    const questions = DUMMY_QUESTIONS_0;

    const copy = questions[0].copyWithChoices(["choice1"]);
    expect(Array.from(copy.choices.keys())).toEqual(["choice1"]);
  });

  test("copyWithChoicesThrows", () => {
    const questions = DUMMY_QUESTIONS_0;

    expect(() => questions[0].copyWithChoices(["doesnotexist"])).toThrow();
  });

  test("sortMostRecentFirst", () => {
    const oldQuestion = new StoryQuestion(
      "q0v0",
      "param0",
      "Question 0 V0",
      0,
      new Date(2020, 0, 1),
      []
    );

    const newQuestion = new StoryQuestion(
      "q0v1",
      "param0",
      "Question 0 V1",
      0,
      new Date(2021, 0, 1), // V1 hopefully comes after V0.
      []
    );

    let array = [oldQuestion, newQuestion];
    StoryQuestion.sortMostRecentFirst(array);
    expect(array).toEqual([newQuestion, oldQuestion]);

    array = [newQuestion, oldQuestion];
    StoryQuestion.sortMostRecentFirst(array);
    expect(array).toEqual([newQuestion, oldQuestion]);
  });

  test("sortPriority", () => {
    const highPriority = new StoryQuestion(
      "q0",
      "param0",
      "Question 0",
      0,
      new Date(2020, 0, 1),
      []
    );

    const lowPriority = new StoryQuestion(
      "q1",
      "param1",
      "Question 1",
      10,
      new Date(2020, 0, 1),
      []
    );

    let array = [highPriority, lowPriority];
    StoryQuestion.sortPriority(array);
    expect(array).toEqual([highPriority, lowPriority]);

    array = [lowPriority, highPriority];
    StoryQuestion.sortPriority(array);
    expect(array).toEqual([highPriority, lowPriority]);
  });
});
