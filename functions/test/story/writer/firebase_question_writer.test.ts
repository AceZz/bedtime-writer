import { beforeAll, beforeEach, test } from "@jest/globals";
import { initFirebase } from "../../../src/firebase/utils";
import { FirestoreTestUtils } from "../utils/firestore_test_utils";

const questions = new FirestoreTestUtils("question_writer").questions;

// Check we are running in emulator mode before initializing Firebase.
beforeAll(() => {
  initFirebase(true);
});

beforeEach(async () => {
  await questions.deleteCollection();
});

test.only("Simple write", async () => {
  const samples = await questions.samples();
  await questions.writer.write(samples[0]);
  await questions.expectQuestionsToBe(samples[0]);
});

test("Complex write", async () => {
  const samples = await questions.samples();
  await questions.writer.write(samples[0]);
  await questions.writer.write(samples[1]);

  await questions.expectQuestionsToBe(samples[1]);
});

test("Write twice", async () => {
  const samples = await questions.samples();
  await questions.writer.write(samples[0]);
  await questions.writer.write(samples[0]);

  await questions.expectQuestionsToBe(samples[0]);
});