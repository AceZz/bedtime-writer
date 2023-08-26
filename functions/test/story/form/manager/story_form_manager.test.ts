import { test, expect, describe, beforeAll } from "@jest/globals";
import { StoryQuestion } from "../../../../src/story";
import { QUESTIONS } from "./questions";
import { StoryFormManager } from "../../../../src/story/form/manager/story_form_manager";

/**
 * Straightforward implementation of `StoryFormManager` for tests.
 */
describe("StoryFormManager", () => {
  let allQuestions: StoryQuestion[];
  let manager: StoryFormManager;

  // Check we are running in emulator mode before initializing Firebase.
  beforeAll(async () => {
    allQuestions = await QUESTIONS();
    manager = new StoryFormManager(allQuestions, 2, 2);
  });

  test("generateForms numForms = 0", () => {
    expect(Array.from(manager.generateForms(0))).toEqual([]);
  });

  test("generateForms numForms = 1", () => {
    const forms = Array.from(manager.generateForms(1));
    expect(forms.length).toBe(1);
  });

  test("generateForms numForms = 10", () => {
    const forms = Array.from(manager.generateForms(10));
    expect(forms.length).toBe(10);
  });

  test("generateForms numForms = allForms", () => {
    // 3 questions that qualify (q0v1, q1v0, q2v0).
    // Each question has 4 choices, so 2 among 4 = 6 variations.
    // 2 questions per form, so 6 * 6 = 36 forms per couple of questions.
    // Since q0v1 is mandatory (priority = 0), 2 couples of questions.
    // So 36 * 2 = 72 possible forms.
    const forms = Array.from(manager.generateForms(72));

    for (const form of forms) {
      expect(form.questionIds).toContain("q0v1");

      for (const question of form.questions.values()) {
        expect(question.choices.size).toBe(2);
      }
    }
  });

  test("generateForms numForms > allForms", () => {
    expect(() => Array.from(manager.generateForms(73))).toThrow();
  });
});
