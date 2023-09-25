import { beforeAll, beforeEach, describe, expect, test } from "@jest/globals";
import { initEnv, initFirebase } from "../../../../src/firebase";
import { FirestoreContextUtils } from "../../utils";
import {
  DUMMY_QUESTIONS,
  DUMMY_QUESTIONS_0,
  DUMMY_QUESTIONS_1,
} from "../../../story/data";
import { listToMapById } from "../../../../src/utils";

const storyQuestions = new FirestoreContextUtils("firestore_story_questions")
  .storyQuestions;

describe("FirestoreStoryQuestions", () => {
  beforeAll(() => {
    initEnv();
    initFirebase(true);
  });

  beforeEach(async () => {
    await storyQuestions.delete();
  });

  test("get() with ids", async () => {
    const expected = [DUMMY_QUESTIONS[0], DUMMY_QUESTIONS[1]];

    await storyQuestions.write(DUMMY_QUESTIONS);

    const questions = await storyQuestions.get({
      ids: expected.map((q) => q.id),
    });
    expect(questions).toStrictEqual(listToMapById(expected));
  });

  test("get() all", async () => {
    const expected = DUMMY_QUESTIONS_0;
    await storyQuestions.write(expected);

    const questions = await storyQuestions.get();
    expect(questions).toStrictEqual(listToMapById(expected));
  });

  test("write()", async () => {
    await storyQuestions.write(DUMMY_QUESTIONS_0);
    await storyQuestions.expectQuestionsToBe(DUMMY_QUESTIONS_0);
  });

  test("write() several", async () => {
    await storyQuestions.write(DUMMY_QUESTIONS_0);
    await storyQuestions.write(DUMMY_QUESTIONS_1);

    await storyQuestions.expectQuestionsToBe(DUMMY_QUESTIONS_1);
  });

  test("write() twice", async () => {
    await storyQuestions.write(DUMMY_QUESTIONS_0);
    await storyQuestions.write(DUMMY_QUESTIONS_0);

    await storyQuestions.expectQuestionsToBe(DUMMY_QUESTIONS_0);
  });
});
