import { beforeAll, beforeEach, describe, expect, test } from "@jest/globals";
import {
  FirebaseStoryQuestionWriter,
  initEnv,
  initFirebase,
} from "../../../../src/firebase";
import { FirestoreContextUtils } from "../../utils";
import { DUMMY_QUESTIONS, DUMMY_QUESTIONS_0 } from "../../../story/data";
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

    const writer = new FirebaseStoryQuestionWriter(storyQuestions);
    await writer.write(DUMMY_QUESTIONS);

    const questions = await storyQuestions.get({
      ids: expected.map((q) => q.id),
    });
    expect(questions).toStrictEqual(listToMapById(expected));
  });

  test("get() all", async () => {
    const expected = DUMMY_QUESTIONS_0;
    const writer = new FirebaseStoryQuestionWriter(storyQuestions);
    await writer.write(expected);

    const questions = await storyQuestions.get();
    expect(questions).toStrictEqual(listToMapById(expected));
  });
});
