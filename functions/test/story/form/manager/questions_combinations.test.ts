import { test, expect, describe, beforeAll } from "@jest/globals";
import { StoryQuestion } from "../../../../src/story";
import { QUESTIONS } from "./questions";
import {
  filterQuestions,
  getQuestions,
  groupQuestions,
  shuffleQuestionsCombinations,
} from "../../../../src/story/form/manager/questions_combinations";

describe("question_combinations", () => {
  let allQuestions: StoryQuestion[];
  let q0v0: StoryQuestion;
  let q0v1: StoryQuestion;
  let q1v0: StoryQuestion;
  let q2v0: StoryQuestion;

  // Check we are running in emulator mode before initializing Firebase.
  beforeAll(async () => {
    allQuestions = await QUESTIONS();
    [q0v0, q0v1, q1v0, q2v0] = allQuestions;
  });

  test("shuffleQuestionsCombinations", async () => {
    const combinations = Array.from(
      shuffleQuestionsCombinations(allQuestions, 2)
    );

    // q0 is mandatory (priority = 0), so we always have it.
    expect(combinations.length).toBe(2);
    expect([
      [
        [q0v1, q1v0],
        [q0v1, q2v0],
      ],
      [
        [q0v1, q2v0],
        [q0v1, q1v0],
      ],
    ]).toContainEqual(combinations);
  });

  test("getQuestions", async () => {
    expect(getQuestions(allQuestions)).toEqual({
      mandatory: [q0v1],
      optional: [q1v0, q2v0],
    });
  });

  test("filterQuestions", async () => {
    expect(filterQuestions(allQuestions)).toEqual([q0v1, q1v0, q2v0]);
  });

  test("groupQuestions", async () => {
    expect(groupQuestions(allQuestions)).toEqual(
      new Map([
        ["param0", [q0v0, q0v1]],
        ["param1", [q1v0]],
        ["param2", [q2v0]],
      ])
    );
  });
});
