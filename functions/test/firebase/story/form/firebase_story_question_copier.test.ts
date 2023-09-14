import { beforeAll, beforeEach, describe, expect, test } from "@jest/globals";
import {
  FirebaseStoryQuestionCopier,
  FirebaseStoryQuestionWriter,
  dumpCollection,
  initEnv,
  initFirebase,
} from "../../../../src/firebase";
import { FirestoreContextUtils } from "../../utils";
import { DUMMY_QUESTIONS } from "../../../story/data";

const origin = new FirestoreContextUtils("question_copier_origin")
  .storyQuestions;
const dest = new FirestoreContextUtils("question_copier_dest").storyQuestions;

describe("FirebaseStoryQuestionCopier", () => {
  let writer: FirebaseStoryQuestionWriter;

  beforeAll(() => {
    initEnv();
    initFirebase(true);
    writer = new FirebaseStoryQuestionWriter(origin);
  });

  beforeEach(async () => {
    await origin.delete();
    await dest.delete();
  });

  test("copy() all", async () => {
    await writer.write(DUMMY_QUESTIONS);

    const copier = new FirebaseStoryQuestionCopier(
      (question) => question,
      origin,
      dest
    );
    await copier.copy();

    dest.expectQuestionsToBe(DUMMY_QUESTIONS);
  });

  test("copy() filtered", async () => {
    await writer.write(DUMMY_QUESTIONS);

    const copier = new FirebaseStoryQuestionCopier(
      (question) => {
        return {
          priority: question.priority,
        };
      },
      origin,
      dest
    );
    await copier.copy();

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
    await writer.write(DUMMY_QUESTIONS);

    const copier = new FirebaseStoryQuestionCopier(
      (question) => question,
      origin,
      dest
    );

    await copier.copy({ ids: [DUMMY_QUESTIONS[0].id, DUMMY_QUESTIONS[1].id] });

    dest.expectQuestionsToBe([DUMMY_QUESTIONS[0], DUMMY_QUESTIONS[1]]);
  });
});
