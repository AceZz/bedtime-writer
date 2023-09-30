import { beforeAll, beforeEach, describe, expect, test } from "@jest/globals";
import {
  dumpCollection,
  initEnv,
  initFirebase,
} from "../../../../src/firebase";
import { FirestoreContextUtils } from "../../utils";
import {
  DUMMY_QUESTIONS,
  DUMMY_QUESTIONS_0,
  DUMMY_QUESTIONS_1,
} from "../../../story/data";
import { listToMapById } from "../../../../src/utils";

const storyQuestions = new FirestoreContextUtils("firestore_story_questions")
  .storyQuestions;
const dest = new FirestoreContextUtils("firestore_story_questions_dest")
  .storyQuestions;

describe("FirestoreStoryQuestions", () => {
  beforeAll(() => {
    initEnv();
    initFirebase(true);
  });

  beforeEach(async () => {
    await storyQuestions.delete();
    await dest.delete();
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

  test("copy() all", async () => {
    await storyQuestions.write(DUMMY_QUESTIONS);
    await storyQuestions.copy(dest, (question) => question);
    await dest.expectQuestionsToBe(DUMMY_QUESTIONS);
  });

  test("copy() filtered", async () => {
    await storyQuestions.write(DUMMY_QUESTIONS);
    await storyQuestions.copy(dest, (question) => {
      return {
        priority: question.priority,
      };
    });

    const actual = await dumpCollection(dest);
    expect(actual).toEqual(
      new Map([
        [
          "question1V1",
          {
            priority: 0,
          },
        ],
        [
          "question2V1",
          {
            priority: 1,
          },
        ],
        [
          "question3V1",
          {
            priority: 1,
          },
        ],
      ])
    );
  });

  test("copy() some", async () => {
    await storyQuestions.write(DUMMY_QUESTIONS);
    await storyQuestions.copy(dest, (question) => question, {
      ids: [DUMMY_QUESTIONS[0].id, DUMMY_QUESTIONS[1].id],
    });
    await dest.expectQuestionsToBe([DUMMY_QUESTIONS[0], DUMMY_QUESTIONS[1]]);
  });
});
