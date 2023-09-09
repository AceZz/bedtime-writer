import { StoryForm, StoryQuestion } from "../../../src/story";
import {
  DUMMY_QUESTIONS_0,
  DUMMY_QUESTIONS_1,
  QUESTIONS_CHARACTER,
  REAL_QUESTIONS,
  dummyStoryChoice,
} from "./story_question";

/**
 * Works with DUMMY_QUESTIONS_0.
 */
export const DUMMY_FORM_0 = new StoryForm(
  DUMMY_QUESTIONS_0,
  new Date("2020-01-01T12:00:00Z")
);

export const SERIALIZED_DUMMY_FORM_0 = {
  datetime: new Date("2020-01-01T12:00:00Z"),
  numQuestions: 2,
  question0: "question1V1",
  question0Choices: ["choice1", "choice2"],
  question1: "question2V1",
  question1Choices: ["choice1", "choice2"],
  isCached: false,
};

/**
 * Works with DUMMY_QUESTIONS_1.
 */
export const DUMMY_FORM_1 = new StoryForm(
  DUMMY_QUESTIONS_1,
  new Date("2023-01-01T12:00:00Z")
);

export const SERIALIZED_DUMMY_FORM_1 = {
  datetime: new Date("2023-01-01T12:00:00Z"),
  numQuestions: 2,
  question0: "question1V1",
  question0Choices: ["choice1", "choice3"],
  question1: "question3V1",
  question1Choices: ["choice1", "choice2"],
  isCached: false,
};

/**
 * Does not work with DUMMY_QUESTIONS_0 (question does not exist).
 */
export const DUMMY_FORM_2 = new StoryForm(
  [
    new StoryQuestion(
      "doesnotexistV1",
      "doesnotexist",
      "Does not exist",
      0,
      new Date("2023-01-01T12:00:00Z"),
      [dummyStoryChoice("choice1")]
    ),
  ],
  new Date("2023-01-01T12:00:00Z")
);

/**
 * Does not work with DUMMY_QUESTIONS_0 (choice does not exist).
 */
export const DUMMY_FORM_3 = new StoryForm(
  [
    new StoryQuestion(
      "question1V1",
      "question1",
      "Question 1",
      0,
      new Date("2023-01-01T12:00:00Z"),
      [dummyStoryChoice("doesnotexist")]
    ),
  ],
  new Date("2023-01-01T12:00:00Z")
);

export const REAL_FORM_0 = new StoryForm(
  [
    REAL_QUESTIONS[0],
    REAL_QUESTIONS[1].copyWithChoices(["animal", "friend", "lost"]),
    REAL_QUESTIONS[2].copyWithChoices(["failure", "giveUp", "lazy"]),
  ],
  undefined
);

export const FORM_CHARACTER_ID = "form_id_0";

/**
 * Works with QUESTIONS_CHARACTER.
 */
export const FORM_CHARACTER = new StoryForm(
  QUESTIONS_CHARACTER,
  new Date("2020-01-01T12:00:00Z")
);
