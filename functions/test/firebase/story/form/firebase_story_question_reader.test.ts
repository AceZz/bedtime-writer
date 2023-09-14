import { beforeAll, beforeEach, describe, expect, test } from "@jest/globals";
import {
  FirebaseStoryQuestionReader,
  FirebaseStoryQuestionWriter,
  initEnv,
  initFirebase,
} from "../../../../src/firebase";
import { FirestoreContextUtils } from "../../utils";
import { DUMMY_QUESTIONS, DUMMY_QUESTIONS_0 } from "../../../story/data";
import { listToMapById } from "../../../../src/utils";

const storyQuestions = new FirestoreContextUtils("question_reader")
  .storyQuestions;

describe("FirebaseStoryQuestionReader", () => {
  beforeAll(() => {
    initEnv();
    initFirebase(true);
  });

  beforeEach(async () => {
    await storyQuestions.delete();
  });

  test("get() with ids", async () => {
    const expected = [DUMMY_QUESTIONS[0], DUMMY_QUESTIONS[1]];

    const writer = new FirebaseStoryQuestionWriter(storyQuestions);
    await writer.write(DUMMY_QUESTIONS);

    const reader = new FirebaseStoryQuestionReader(storyQuestions);
    const questions = await reader.get({ ids: expected.map((q) => q.id) });
    expect(questions).toStrictEqual(listToMapById(expected));
  });

  test("get() all", async () => {
    const expected = DUMMY_QUESTIONS_0;
    const writer = new FirebaseStoryQuestionWriter(storyQuestions);
    await writer.write(expected);

    const reader = new FirebaseStoryQuestionReader(storyQuestions);
    const questions = await reader.get();
    expect(questions).toStrictEqual(listToMapById(expected));
  });
});
