import { beforeAll, beforeEach, describe, test } from "@jest/globals";
import { initEnv, initFirebase } from "../../../../src/firebase";
import { FirestoreTestUtils } from "../../utils/firestore_test_utils";
import { QUESTIONS_0, QUESTIONS_1 } from "../../data";
import { FirebaseQuestionWriter } from "../../../../src/story";

const questions = new FirestoreTestUtils("question_writer").questions;

describe("FirebaseQuestionWriter", () => {
  let writer: FirebaseQuestionWriter;

  // Check we are running in emulator mode before initializing Firebase.
  beforeAll(() => {
    initEnv();
    initFirebase(true);
    writer = new FirebaseQuestionWriter(questions);
  });

  beforeEach(async () => {
    await questions.delete();
  });

  test("Simple write", async () => {
    await writer.write(await QUESTIONS_0());
    await questions.expectQuestionsToBe(await QUESTIONS_0());
  });

  test("Complex write", async () => {
    await writer.write(await QUESTIONS_0());
    await writer.write(await QUESTIONS_1());

    await questions.expectQuestionsToBe(await QUESTIONS_1());
  });

  test("Write twice", async () => {
    await writer.write(await QUESTIONS_0());
    await writer.write(await QUESTIONS_0());

    await questions.expectQuestionsToBe(await QUESTIONS_0());
  });
});
