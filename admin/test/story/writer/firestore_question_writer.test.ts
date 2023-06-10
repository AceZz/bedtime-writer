import { beforeAll, beforeEach, test } from "@jest/globals";
import { initFirebase } from "../../../src/firebase_utils";
import { FirestoreTestUtils } from "../utils/firestore_test_utils";

const questions = new FirestoreTestUtils("question_writer").questions;

// Check we are running in emulator mode before initializing Firebase.
beforeAll(() => {
  initFirebase(true);
});

beforeEach(async () => {
  await questions.deleteCollection();
});

test("Simple write", async () => {
  await questions.writer.write(questions.samples[0]);
  await questions.expectQuestionsToBe(questions.samples[0]);
});

test("Complex write", async () => {
  await questions.writer.write(questions.samples[0]);
  await questions.writer.write(questions.samples[1]);

  await questions.expectQuestionsToBe(questions.samples[1]);
});

test("Write twice", async () => {
  await questions.writer.write(questions.samples[0]);
  await questions.writer.write(questions.samples[0]);

  await questions.expectQuestionsToBe(questions.samples[0]);
});
