import { beforeAll, beforeEach, expect, test } from "@jest/globals";
import { initEnv, initFirebase } from "../../../../src/firebase";
import { FirestoreTestUtils } from "../../utils/firestore_test_utils";
import {
  FORM_0,
  FORM_1,
  SERIALIZED_FORM_0,
  SERIALIZED_FORM_1,
} from "../../data";
import { FirebaseFormReader } from "../../../../src/story";

const firestoreForms = new FirestoreTestUtils("form_reader").forms;

// Check we are running in emulator mode before initializing Firebase.
beforeAll(() => {
  initEnv();
  initFirebase(true);
});

beforeEach(async () => await firestoreForms.delete());

test("FirebaseFormReader", async () => {
  await firestoreForms.formsRef().add(SERIALIZED_FORM_0);
  await firestoreForms.formsRef().add(SERIALIZED_FORM_1);

  const reader = new FirebaseFormReader(firestoreForms);
  const forms = await reader.read();
  forms.sort((a, b) => a.start.getTime() - b.start.getTime());

  expect(forms).toStrictEqual([FORM_0, FORM_1]);
});
