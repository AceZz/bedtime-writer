import { beforeAll, beforeEach, expect, test } from "@jest/globals";
import {
  FirebaseStoryQuestionWriter,
  initEnv,
  initFirebase,
} from "../../../../src/firebase";
import { FirestoreContextUtils } from "../../../firebase/utils";
import { QUESTIONS_0 } from "../../data";
import { FirebaseQuestionReader } from "../../../../src/story";

const storyQuestions = new FirestoreContextUtils("question_reader")
  .storyQuestions;

// Check we are running in emulator mode before initializing Firebase.
beforeAll(() => {
  initEnv();
  initFirebase(true);
});

beforeEach(async () => {
  await storyQuestions.delete();
});

test("FirebaseQuestionReader", async () => {
  const expected = await QUESTIONS_0();
  const writer = new FirebaseStoryQuestionWriter(storyQuestions);
  await writer.write(expected);

  const reader = new FirebaseQuestionReader(storyQuestions);
  const questions = await reader.read();
  expect(questions).toStrictEqual(expected);
});
