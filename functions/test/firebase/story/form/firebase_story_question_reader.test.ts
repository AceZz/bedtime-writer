import { beforeAll, beforeEach, expect, test } from "@jest/globals";
import {
  FirebaseStoryQuestionReader,
  FirebaseStoryQuestionWriter,
  initEnv,
  initFirebase,
} from "../../../../src/firebase";
import { FirestoreContextUtils } from "../../utils";
import { DUMMY_QUESTIONS_0 } from "../../../story/data";

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

test("FirebaseStoryQuestionReader", async () => {
  const expected = DUMMY_QUESTIONS_0;
  const writer = new FirebaseStoryQuestionWriter(storyQuestions);
  await writer.write(expected);

  const reader = new FirebaseStoryQuestionReader(storyQuestions);
  const questions = await reader.readAll();
  expect(questions).toStrictEqual(expected);
});
