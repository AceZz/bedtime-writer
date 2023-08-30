// We create the test data here because it relies on specific assumptions which
// must not be affected by other code.

import { StoryQuestion } from "../../../../src/story";
import { dummyStoryChoices } from "../../data";

export const Q0V0 = new StoryQuestion(
  "q0v0",
  "param0",
  "Question 0 V0",
  0,
  new Date(2020, 0, 1),
  dummyStoryChoices(["q0v0-c0", "q0v0-c1", "q0v0-c2", "q0v0-c3"])
);

export const Q0V1 = new StoryQuestion(
  "q0v1",
  "param0",
  "Question 0 V1",
  0,
  new Date(2021, 0, 1), // V1 hopefully comes after V0.
  dummyStoryChoices(["q0v1-c0", "q0v1-c1", "q0v1-c2", "q0v1-c3"])
);

export const Q1V0 = new StoryQuestion(
  "q1v0",
  "param1",
  "Question 1 V0",
  1,
  new Date(2022, 0, 1),
  dummyStoryChoices(["q1v0-c0", "q1v0-c1", "q1v0-c2", "q1v0-c3"])
);

export const Q2V0 = new StoryQuestion(
  "q2v0",
  "param2",
  "Question 2 V0",
  1,
  new Date(2022, 0, 1),
  dummyStoryChoices(["q2v0-c0", "q2v0-c1", "q2v0-c2", "q2v0-c3"])
);

export const QUESTIONS = [Q0V0, Q0V1, Q1V0, Q2V0];
