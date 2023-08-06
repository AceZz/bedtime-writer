import { test, expect } from "@jest/globals";
import { StoryForm } from "../../src/story";

test("StoryForm: getAllFormResponses should return correct questions and formResponses", () => {
  const questionsToChoices = new Map([
    ["question1", ["choice1", "choice2"]],
    ["question2", ["choice3", "choice4"]],
  ]);
  const expectedQuestions = ["question1", "question2"];
  const expectedFormResponses = [
    ["choice1", "choice3"],
    ["choice1", "choice4"],
    ["choice2", "choice3"],
    ["choice2", "choice4"],
  ];

  const actual = StoryForm.getAllFormResponses(questionsToChoices);
  expect(actual.questions).toEqual(expectedQuestions);
  expect(actual.formResponses).toEqual(expectedFormResponses);
});
