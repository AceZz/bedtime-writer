import { StoryForm } from "../../../src/story";
import { QUESTIONS_CHARACTER } from "./story_question";

/**
 * Works with FORM_QUESTIONS_0.
 */
export const FORM_0 = new StoryForm(
  new Map([
    ["question1V1", ["choice1", "choice2"]],
    ["question2V1", ["choice1"]],
  ]),
  new Date("2020-01-01T12:00:00Z")
);

export const SERIALIZED_FORM_0 = {
  start: new Date("2020-01-01T12:00:00Z"),
  numQuestions: 2,
  question0: "question1V1",
  question0Choices: ["choice1", "choice2"],
  question1: "question2V1",
  question1Choices: ["choice1"],
};

export const FORM_QUESTIONS_0 = ["question1V1", "question2V1"];

export const FORM_RESPONSES_0 = [
  ["choice1", "choice1"],
  ["choice2", "choice1"],
];

/**
 * Works with FORM_QUESTIONS_0.
 */
export const FORM_1 = new StoryForm(
  new Map([
    ["question1V1", ["choice1", "choice2"]],
    ["question2V1", ["choice2"]],
  ]),
  new Date("2023-01-01T12:00:00Z")
);

export const SERIALIZED_FORM_1 = {
  start: new Date("2023-01-01T12:00:00Z"),
  numQuestions: 2,
  question0: "question1V1",
  question0Choices: ["choice1", "choice2"],
  question1: "question2V1",
  question1Choices: ["choice2"],
};

/**
 * Does not work with FORM_QUESTIONS_0 (question does not exist).
 */
export const FORM_2 = new StoryForm(
  new Map([["doesnotexist", ["one", "two", "three"]]]),
  new Date("2023-01-01T12:00:00Z")
);

/**
 * Does not work with FORM_QUESTIONS_0 (choice does not exist).
 */
export const FORM_3 = new StoryForm(
  new Map([["question1V1", ["doesnotexist", "choice2"]]]),
  new Date("2023-01-01T12:00:00Z")
);

export const FORM_CHARACTER_ID = "form_id_0";

/**
 * Works with QUESTIONS_CHARACTER.
 */
export async function FORM_CHARACTER(): Promise<StoryForm> {
  const questions = await QUESTIONS_CHARACTER();

  return new StoryForm(
    new Map(
      questions.map((question) => [
        question.promptParam,
        question.choices.map((choice) => choice.id),
      ])
    ),
    new Date("2020-01-01T12:00:00Z")
  );
}
