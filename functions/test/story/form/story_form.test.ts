import { test, expect, describe } from "@jest/globals";
import { StoryForm } from "../../../src/story";
import { ALL_QUESTIONS, QUESTIONS_0 } from "../data";
import { listToMapById } from "../../../src/utils";

describe("StoryForm", () => {
  test("toString", async () => {
    const questions = await ALL_QUESTIONS();
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
