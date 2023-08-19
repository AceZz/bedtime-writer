import { test, expect, describe, beforeAll } from "@jest/globals";
import { StoryQuestion } from "../../../../src/story";
import { QUESTIONS } from "./questions";
import { iterQuestionsVariations } from "../../../../src/story/form/manager/questions_variations";

describe("choice_combinations", () => {
  let allQuestions: StoryQuestion[];
  let q0v1: StoryQuestion;

  // Check we are running in emulator mode before initializing Firebase.
  beforeAll(async () => {
    allQuestions = await QUESTIONS();
    q0v1 = allQuestions[1];
  });

  test("iterQuestionsVariations", () => {
    const combinations = Array.from(iterQuestionsVariations(q0v1, 2));
    expect(combinations.length).toBe(6);

    // Check unicity.
    const set = new Set(
      combinations.map((question) => question.choiceIds.join(""))
    );
    expect(set.size).toBe(6);
  });
});
