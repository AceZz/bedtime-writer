import { beforeAll, beforeEach, expect, test } from "@jest/globals";
import { initEnv, initFirebase } from "../../src/firebase";
import { FirestoreContextUtils } from "./utils/";
import { StoryForm } from "../../src/story";
import {
  FORM_QUESTIONS_0,
  FORM_RESPONSES_0,
  SERIALIZED_FORM_0,
} from "../story/data";

const storyForms = new FirestoreContextUtils("story_forms").storyForms;

// Check we are running in emulator mode before initializing Firebase.
beforeAll(() => {
  initEnv();
  initFirebase(true);
});

beforeEach(async () => await storyForms.delete());

test("FirestoreStoryForms returns all possible form responses", async () => {
  const docRef = await storyForms.formsRef().add(SERIALIZED_FORM_0);

  const questionsToChoices = await storyForms.getQuestionsToChoices(docRef.id);
  const { questions: actualQuestions, formResponses: actualFormResponses } =
    StoryForm.getAllFormResponses(questionsToChoices);
  expect(actualQuestions).toEqual(FORM_QUESTIONS_0);
  expect(actualFormResponses).toEqual(FORM_RESPONSES_0);
});
