import { beforeAll, beforeEach, expect, test } from "@jest/globals";
import { initEnv, initFirebase } from "../../../../src/firebase";
import { FirestoreTestUtils } from "../../utils/firestore_test_utils";

const utils = new FirestoreTestUtils("form_reader").forms;

// Check we are running in emulator mode before initializing Firebase.
beforeAll(() => {
  initEnv();
  initFirebase(true);
});

beforeEach(async () => await utils.deleteCollection());

test("FirebaseFormReader", async () => {
  const serializedSamples = utils.serializedSamples();

  await utils.collectionRef().add(serializedSamples[0]);
  await utils.collectionRef().add(serializedSamples[1]);

  const forms = await utils.reader.read();
  forms.sort((a, b) => a.start.getTime() - b.start.getTime());

  const samples = utils.samples();
  expect(forms).toStrictEqual([samples[0], samples[1]]);
});