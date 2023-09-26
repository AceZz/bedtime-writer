import { beforeAll, beforeEach, describe, expect, test } from "@jest/globals";
import {
  FirebaseStoryQuestionReader,
  FirebaseStoryQuestionWriter,
  dumpCollection,
  dumpToCollection,
  initEnv,
  initFirebase,
} from "../../src/firebase";
import { Timestamp } from "firebase-admin/firestore";
import { FirestoreContextUtils } from "./utils";
import { listToMapById } from "../../src/utils";
import { DUMMY_QUESTIONS_0 } from "../story/data";

const questions = new FirestoreContextUtils("firestore_utils").storyQuestions;

describe("firestore_utils", () => {
  beforeAll(() => {
    initEnv();
    initFirebase(true);
  });

  beforeEach(async () => {
    await questions.delete();
  });

  test("dumpToCollection", async () => {
    await dumpToCollection(
      questions,
      listToMapById([
        {
          id: "question1V1",
          createdAt: new Date(2023, 7, 15),
          priority: 0,
          promptParam: "question1",
          text: "Question 1",
          choices: listToMapById([
            {
              id: "choice1",
              image: Buffer.from(""),
              prompt: "Prompt for choice1",
              text: "Text for choice1",
            },
            {
              id: "choice2",
              image: Buffer.from(""),
              prompt: "Prompt for choice2",
              text: "Text for choice2",
            },
          ]),
        },
        {
          id: "question2V1",
          createdAt: new Date(2023, 7, 10),
          priority: 1,
          promptParam: "question2",
          text: "Question 2",
          choices: listToMapById([
            {
              id: "choice1",
              image: Buffer.from(""),
              prompt: "Prompt for choice1",
              text: "Text for choice1",
            },
            {
              id: "choice2",
              image: Buffer.from(""),
              prompt: "Prompt for choice2",
              text: "Text for choice2",
            },
          ]),
        },
      ])
    );

    const reader = new FirebaseStoryQuestionReader(questions);
    expect(await reader.get()).toEqual(listToMapById(DUMMY_QUESTIONS_0));
  });

  test("dumpToCollection does not merge", async () => {
    const writer = new FirebaseStoryQuestionWriter(questions);
    await writer.write(DUMMY_QUESTIONS_0);

    await dumpToCollection(
      questions,
      listToMapById([
        {
          id: "question1V1",
          priority: 100,
          createdAt: new Date(2023, 7, 15),
          choices: listToMapById([
            {
              id: "choice1",
              text: "New text.",
            },
          ]),
        },
      ])
    );

    const reader = new FirebaseStoryQuestionReader(questions);
    const actual = await reader.get();

    expect(actual.size).toBe(2);
    // text was not specified, and thus becomes "".
    expect(actual.get("question1V1")?.text).toBe("");
    // priority was updated.
    expect(actual.get("question1V1")?.priority).toBe(100);
  });

  test("dumpCollection", async () => {
    const writer = new FirebaseStoryQuestionWriter(questions);
    await writer.write(DUMMY_QUESTIONS_0);

    const dump = await dumpCollection(questions);
    expect(dump).toEqual(
      new Map([
        [
          "question1V1",
          {
            createdAt: Timestamp.fromDate(new Date(2023, 7, 15)),
            priority: 0,
            promptParam: "question1",
            text: "Question 1",
            choices: new Map([
              [
                "choice1",
                {
                  image: Buffer.from(""),
                  prompt: "Prompt for choice1",
                  text: "Text for choice1",
                },
              ],
              [
                "choice2",
                {
                  image: Buffer.from(""),
                  prompt: "Prompt for choice2",
                  text: "Text for choice2",
                },
              ],
            ]),
          },
        ],
        [
          "question2V1",
          {
            createdAt: Timestamp.fromDate(new Date(2023, 7, 10)),
            priority: 1,
            promptParam: "question2",
            text: "Question 2",
            choices: new Map([
              [
                "choice1",
                {
                  image: Buffer.from(""),
                  prompt: "Prompt for choice1",
                  text: "Text for choice1",
                },
              ],
              [
                "choice2",
                {
                  image: Buffer.from(""),
                  prompt: "Prompt for choice2",
                  text: "Text for choice2",
                },
              ],
            ]),
          },
        ],
      ])
    );
  });

  test("dumpCollection specific ID", async () => {
    const writer = new FirebaseStoryQuestionWriter(questions);
    await writer.write(DUMMY_QUESTIONS_0);

    const dump = await dumpCollection(questions, ["question1V1"]);
    expect(dump).toEqual(
      new Map([
        [
          "question1V1",
          {
            createdAt: Timestamp.fromDate(new Date(2023, 7, 15)),
            priority: 0,
            promptParam: "question1",
            text: "Question 1",
            choices: new Map([
              [
                "choice1",
                {
                  image: Buffer.from(""),
                  prompt: "Prompt for choice1",
                  text: "Text for choice1",
                },
              ],
              [
                "choice2",
                {
                  image: Buffer.from(""),
                  prompt: "Prompt for choice2",
                  text: "Text for choice2",
                },
              ],
            ]),
          },
        ],
      ])
    );
  });

  test("dumpCollection wrong ID ignored", async () => {
    const writer = new FirebaseStoryQuestionWriter(questions);
    await writer.write(DUMMY_QUESTIONS_0);

    const dump = await dumpCollection(questions, [
      "question1V1",
      "doesnotexist",
    ]);
    expect(dump).toEqual(
      new Map([
        [
          "question1V1",
          {
            createdAt: Timestamp.fromDate(new Date(2023, 7, 15)),
            priority: 0,
            promptParam: "question1",
            text: "Question 1",
            choices: new Map([
              [
                "choice1",
                {
                  image: Buffer.from(""),
                  prompt: "Prompt for choice1",
                  text: "Text for choice1",
                },
              ],
              [
                "choice2",
                {
                  image: Buffer.from(""),
                  prompt: "Prompt for choice2",
                  text: "Text for choice2",
                },
              ],
            ]),
          },
        ],
      ])
    );
  });
});
