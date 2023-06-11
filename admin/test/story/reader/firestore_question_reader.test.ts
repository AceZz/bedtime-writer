import { beforeAll, beforeEach, expect, test } from "@jest/globals";
import { initFirebase } from "../../../src/firebase_utils";
import { FirestoreTestUtils } from "../utils/firestore_test_utils";

const utils = new FirestoreTestUtils("question_writer").questions;

// Check we are running in emulator mode before initializing Firebase.
beforeAll(() => {
  initFirebase(true);
});

beforeEach(async () => {
  await utils.deleteCollection();
});

test("FirestoreQuestionReader", async () => {
  const samples = await utils.samples();

  const expected = samples[0];
  await utils.writer.write(expected);

  const questions = await utils.reader.read();
  expect(questions).toStrictEqual(expected);
});
