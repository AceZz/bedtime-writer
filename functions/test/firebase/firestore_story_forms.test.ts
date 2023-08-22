import { beforeAll, beforeEach, expect, test } from "@jest/globals";
import { initEnv, initFirebase } from "../../src/firebase";
import { FirestoreContextUtils } from "./utils/";
import { StoryForm } from "../../src/story";
import { FORM_0, SERIALIZED_FORM_0 } from "../story/data";

const storyForms = new FirestoreContextUtils("story_forms").storyForms;

// Check we are running in emulator mode before initializing Firebase.
beforeAll(() => {
  initEnv();
  initFirebase(true);
});

beforeEach(async () => await storyForms.delete());

test("FirestoreStoryForms returns all possible form responses", async () => {
  await storyForms.formsRef().add(SERIALIZED_FORM_0);

  const form = FORM_0;
  const q1c1 = form.questions.get("question1V1")?.choices.get("choice1");
  const q1c2 = form.questions.get("question1V1")?.choices.get("choice2");
  const q2c1 = form.questions.get("question2V1")?.choices.get("choice1");
  const q2c2 = form.questions.get("question2V1")?.choices.get("choice2");

  const { questions: actualQuestions, formResponses: actualFormResponses } =
    StoryForm.getAllFormResponses(form.questions);

  expect(actualQuestions).toEqual(Array.from(form.questions.values()));
  expect(actualFormResponses).toEqual([
    [q1c1, q2c1],
    [q1c1, q2c2],
    [q1c2, q2c1],
    [q1c2, q2c2],
  ]);
});
