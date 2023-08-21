import { beforeAll, beforeEach, describe, test } from "@jest/globals";
import {
  FirebaseStoryQuestionWriter,
  initEnv,
  initFirebase,
} from "../../../../src/firebase";
import { FirestoreContextUtils } from "../../utils";
import { QUESTIONS_0, QUESTIONS_1 } from "../../../story/data";

const storyQuestions = new FirestoreContextUtils("question_writer")
  .storyQuestions;

describe("FirebaseStoryQuestionWriter", () => {
  let writer: FirebaseStoryQuestionWriter;

  // Check we are running in emulator mode before initializing Firebase.
  beforeAll(() => {
    initEnv();
    initFirebase(true);
    writer = new FirebaseStoryQuestionWriter(storyQuestions);
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
