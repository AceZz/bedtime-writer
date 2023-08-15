import { test, expect, describe } from "@jest/globals";
import { StoryForm } from "../../../src/story";
import { QUESTIONS_0 } from "../data";
import { listToMapById } from "../../../src/utils";

describe("StoryForm", () => {
  test("getAllFormResponses", async () => {
    const questions = await QUESTIONS_0();
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
});
