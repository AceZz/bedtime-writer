import { test, expect, describe, jest } from "@jest/globals";
import {
  ClassicStoryLogic,
  StoryForm,
  StoryFormAnswerError,
} from "../../../src/story";
import { DUMMY_QUESTIONS, DUMMY_FORM_0, REAL_FORM_0 } from "../data";
import * as random from "../../../src/utils/random";

describe("StoryForm", () => {
  test("toString", () => {
    const questions = DUMMY_QUESTIONS;
    const form = new StoryForm(questions);

    expect(form.toString()).toBe(
      `
Question 1 (question1V1)
  * Text for choice1
  * Text for choice2
  * Text for choice3
Question 2 (question2V1)
  * Text for choice1
  * Text for choice2
Question 3 (question3V1)
  * Text for choice1
  * Text for choice2
`.trim()
    );
  });

  test("fullId", () => {
    const questions = DUMMY_QUESTIONS;
    const form = new StoryForm(questions);

    expect(form.fullId()).toBe(
      "question1V1:choice1,choice2,choice3|question2V1:choice1,choice2|question3V1:choice1,choice2"
    );
  });

  test("getAllAnswers", () => {
    expect(DUMMY_FORM_0.getAllAnswers()).toEqual([
      new Map([
        ["question1V1", "choice1"],
        ["question2V1", "choice1"],
      ]),
      new Map([
        ["question1V1", "choice1"],
        ["question2V1", "choice2"],
      ]),
      new Map([
        ["question1V1", "choice2"],
        ["question2V1", "choice1"],
      ]),
      new Map([
        ["question1V1", "choice2"],
        ["question2V1", "choice2"],
      ]),
    ]);
  });

  test("toClassicLogic", () => {
    jest
      .spyOn(random, "pickRandom")
      .mockReturnValueOnce(7)
      .mockReturnValueOnce("my style");

    const logic = REAL_FORM_0.toClassicLogic(
      new Map([
        ["characterNameV1", "frosty"],
        ["characterChallengeV1", "animal"],
        ["characterFlawV1", "failure"],
      ])
    );

    expect(logic).toEqual(
      new ClassicStoryLogic(
        7,
        "my style",
        "Prompt for frosty",
        undefined,
        undefined,
        "Prompt for failure",
        undefined,
        "Prompt for animal"
      )
    );
  });

  test("validateAnswer", () => {
    const form = DUMMY_FORM_0;

    expect(
      form.validateAnswer(
        new Map([
          ["question1V1", "choice1"],
          ["question2V1", "choice2"],
        ])
      )
    );
  });

  test("validateAnswer missing question", () => {
    const form = DUMMY_FORM_0;

    expect(() =>
      form.validateAnswer(new Map([["question1V1", "choice1"]]))
    ).toThrow(new StoryFormAnswerError("Missing questions: [question2V1]."));
  });

  test("validateAnswer invalid question", () => {
    const form = DUMMY_FORM_0;

    expect(() =>
      form.validateAnswer(
        new Map([
          ["question1V1", "choice1"],
          ["question2V1", "choice1"],
          ["unknown", "choice2"],
        ])
      )
    ).toThrow(new StoryFormAnswerError("Invalid questions: [unknown]."));
  });

  test("validateAnswer invalid choice", () => {
    const form = DUMMY_FORM_0;

    expect(() =>
      form.validateAnswer(
        new Map([
          ["question1V1", "choice3"],
          ["question2V1", "choice1"],
        ])
      )
    ).toThrow(
      new StoryFormAnswerError(
        "Invalid choice for question question1V1: choice3."
      )
    );
  });
});
