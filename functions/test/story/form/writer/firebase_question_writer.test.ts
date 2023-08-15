import { beforeAll, beforeEach, describe, test } from "@jest/globals";
import { initEnv, initFirebase } from "../../../../src/firebase";
import { FirestoreContextUtils } from "../../../firebase/utils";
import { QUESTIONS_0, QUESTIONS_1 } from "../../data";
import { FirebaseQuestionWriter } from "../../../../src/story";

const storyQuestions = new FirestoreContextUtils("question_writer")
  .storyQuestions;

describe("FirebaseQuestionWriter", () => {
  let writer: FirebaseQuestionWriter;

  // Check we are running in emulator mode before initializing Firebase.
  beforeAll(() => {
    initEnv();
    initFirebase(true);
    writer = new FirebaseQuestionWriter(storyQuestions);
  });

  beforeEach(async () => {
    await storyQuestions.delete();
  });

  test("Simple write", async () => {
    await writer.write(await QUESTIONS_0());
    await storyQuestions.expectQuestionsToBe(await QUESTIONS_0());
  });

  test("Complex write", async () => {
    await writer.write(await QUESTIONS_0());
    await writer.write(await QUESTIONS_1());

    await storyQuestions.expectQuestionsToBe(await QUESTIONS_1());
  });

  test("Write twice", async () => {
    await writer.write(await QUESTIONS_0());
    await writer.write(await QUESTIONS_0());

    await storyQuestions.expectQuestionsToBe(await QUESTIONS_0());
  });
});
