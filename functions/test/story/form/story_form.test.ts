import { test, expect, describe } from "@jest/globals";
import { StoryForm, StoryFormAnswerError } from "../../../src/story";
import { DUMMY_QUESTIONS, DUMMY_FORM_0, DUMMY_QUESTIONS_0 } from "../data";
import { listToMapById } from "../../../src/utils";

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

  test("getAllFormResponses", () => {
    const questions = DUMMY_QUESTIONS_0;
    const q0c1 = questions[0].choices.get("choice1");
    const q0c2 = questions[0].choices.get("choice2");
    const q1c1 = questions[1].choices.get("choice1");
    const q1c2 = questions[1].choices.get("choice2");

    const expectedFormResponses = [
      [q0c1, q1c1],
      [q0c1, q1c2],
      [q0c2, q1c1],
      [q0c2, q1c2],
    ];

    const actual = StoryForm.getAllFormResponses(listToMapById(questions));
    expect(actual.questions).toEqual(questions);
    expect(actual.formResponses).toEqual(expectedFormResponses);
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
