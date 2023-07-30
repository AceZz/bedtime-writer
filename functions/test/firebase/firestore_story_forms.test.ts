import { beforeAll, beforeEach, expect, test } from "@jest/globals";
import { initFirebase } from "../../src/firebase/utils";
import { FirestoreTestUtils } from "../story/utils/firestore_test_utils";

const utils = new FirestoreTestUtils("story_forms").forms;

// Check we are running in emulator mode before initializing Firebase.
beforeAll(() => {
  initFirebase(true);
});

beforeEach(async () => await utils.deleteCollection());

test("FirestoreStoryForms: ChoicesCombinations", async () => {
  const serializedSamples = utils.serializedSamples();

  const docRef = await utils.collectionRef().add(serializedSamples[0]);

  const actual = await utils.collection.getChoicesCombinations(docRef.id);

  const expected = utils.choicesCombinations();
  expect(actual.sort()).toEqual(expected.sort());
});
