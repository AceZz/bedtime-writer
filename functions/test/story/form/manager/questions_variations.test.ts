import { test, expect, describe } from "@jest/globals";
import { Q0V1 } from "./questions";
import { iterQuestionsVariations } from "../../../../src/story/form/manager/questions_variations";

describe("choice_combinations", () => {
  test("iterQuestionsVariations", () => {
    const combinations = Array.from(iterQuestionsVariations(Q0V1, 2));
    expect(combinations.length).toBe(6);

    // Check unicity.
    const set = new Set(
      combinations.map((question) => question.choiceIds.join(""))
    );
    expect(set.size).toBe(6);
  });
});
