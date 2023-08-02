import { beforeAll, beforeEach, expect, test } from "@jest/globals";
import { initEnv, initFirebase } from "../../src/firebase/utils";
import { FirestoreTestUtils } from "../story/utils/firestore_test_utils";

const utils = new FirestoreTestUtils("story_forms").forms;

// Check we are running in emulator mode before initializing Firebase.
beforeAll(() => {
  initEnv();
  initFirebase(true);
});

beforeEach(async () => await utils.deleteCollection());

test("FirestoreStoryForms returns all possible form responses", async () => {
  const serializedSamples = utils.serializedSamples();

  const docRef = await utils.collectionRef().add(serializedSamples[0]);

  const { questions: actualQuestions, formResponses: actualFormResponses } =
    await utils.collection.getAllFormResponses(docRef.id);

  const expectedQuestions = utils.questions();
  const expectedFormResponses = utils.formResponses();
  expect(actualQuestions).toEqual(expectedQuestions);
  expect(actualFormResponses).toEqual(expectedFormResponses);
});
