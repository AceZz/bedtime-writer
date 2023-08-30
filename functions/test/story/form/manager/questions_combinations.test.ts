import { test, expect, describe } from "@jest/globals";
import { Q0V0, Q0V1, Q1V0, Q2V0, QUESTIONS } from "./questions";
import {
  filterQuestions,
  getQuestions,
  groupQuestions,
  shuffleQuestionsCombinations,
} from "../../../../src/story/form/manager/questions_combinations";

describe("question_combinations", () => {
  test("shuffleQuestionsCombinations", async () => {
    const combinations = Array.from(shuffleQuestionsCombinations(QUESTIONS, 2));

    // q0 is mandatory (priority = 0), so we always have it.
    expect(combinations.length).toBe(2);
    expect([
      [
        [Q0V1, Q1V0],
        [Q0V1, Q2V0],
      ],
      [
        [Q0V1, Q2V0],
        [Q0V1, Q1V0],
      ],
    ]).toContainEqual(combinations);
  });

  test("getQuestions", async () => {
    expect(getQuestions(QUESTIONS)).toEqual({
      mandatory: [Q0V1],
      optional: [Q1V0, Q2V0],
    });
  });

  test("filterQuestions", async () => {
    expect(filterQuestions(QUESTIONS)).toEqual([Q0V1, Q1V0, Q2V0]);
  });

  test("groupQuestions", async () => {
    expect(groupQuestions(QUESTIONS)).toEqual(
      new Map([
        ["param0", [Q0V0, Q0V1]],
        ["param1", [Q1V0]],
        ["param2", [Q2V0]],
      ])
    );
  });
});
