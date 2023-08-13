import { beforeAll, beforeEach, expect, test } from "@jest/globals";
import { initEnv, initFirebase } from "../../../../src/firebase";
import { FirestoreTestUtils } from "../../utils/firestore_test_utils";
import { FirestoreQuestionsTestUtils } from "../../utils/firestore_questions_test_utils";

let utils: FirestoreQuestionsTestUtils;

// Check we are running in emulator mode before initializing Firebase.
beforeAll(() => {
  initEnv();
  initFirebase(true);
  utils = new FirestoreTestUtils("question_writer").questions;
});

beforeEach(async () => {
  await utils.deleteCollection();
});

test("FirebaseQuestionReader", async () => {
  const samples = await utils.samples();

  const expected = samples[0];
  await utils.writer.write(expected);

  const questions = await utils.reader.read();
  expect(questions).toStrictEqual(expected);
});
