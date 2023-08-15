import { beforeAll, beforeEach, expect, test } from "@jest/globals";
import { initEnv, initFirebase } from "../../../../src/firebase";
import { FirestoreTestUtils } from "../../utils/firestore_test_utils";
import { QUESTIONS_0 } from "../../data";
import {
  FirebaseQuestionReader,
  FirebaseQuestionWriter,
} from "../../../../src/story";

const utils = new FirestoreTestUtils("question_writer").questions;

// Check we are running in emulator mode before initializing Firebase.
beforeAll(() => {
  initEnv();
  initFirebase(true);
});

beforeEach(async () => {
  await utils.deleteCollection();
});

test("FirebaseQuestionReader", async () => {
  const expected = await QUESTIONS_0();
  const writer = new FirebaseQuestionWriter(utils.questions);
  await writer.write(expected);

  const reader = new FirebaseQuestionReader(utils.questions);
  const questions = await reader.read();
  expect(questions).toStrictEqual(expected);
});
