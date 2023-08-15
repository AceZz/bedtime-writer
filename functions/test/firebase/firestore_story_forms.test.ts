import { beforeAll, beforeEach, expect, test } from "@jest/globals";
import { initEnv, initFirebase } from "../../src/firebase";
import { FirestoreTestUtils } from "../story/utils/firestore_test_utils";
import { StoryForm } from "../../src/story";
import {
  FORM_QUESTIONS_0,
  FORM_RESPONSES_0,
  SERIALIZED_FORM_0,
} from "../story/data";

const firestoreForms = new FirestoreTestUtils("story_forms").forms;

// Check we are running in emulator mode before initializing Firebase.
beforeAll(() => {
  initEnv();
  initFirebase(true);
});

beforeEach(async () => await firestoreForms.delete());

test("FirestoreStoryForms returns all possible form responses", async () => {
  const docRef = await firestoreForms.formsRef().add(SERIALIZED_FORM_0);

  const questionsToChoices = await firestoreForms.getQuestionsToChoices(
    docRef.id
  );
  const { questions: actualQuestions, formResponses: actualFormResponses } =
    StoryForm.getAllFormResponses(questionsToChoices);
  expect(actualQuestions).toEqual(FORM_QUESTIONS_0);
  expect(actualFormResponses).toEqual(FORM_RESPONSES_0);
});
