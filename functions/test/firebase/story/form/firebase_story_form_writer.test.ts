import { beforeAll, expect, beforeEach, test, describe } from "@jest/globals";
import {
  initEnv,
  initFirebase,
  FirebaseStoryFormWriter,
  FirebaseStoryQuestionWriter,
  FirebaseStoryQuestionReader,
} from "../../../../src/firebase";
import { FirestoreContextUtils } from "../../utils";
import {
  ALL_QUESTIONS,
  FORM_0,
  FORM_1,
  FORM_2,
  FORM_3,
  SERIALIZED_FORM_0,
  SERIALIZED_FORM_1,
} from "../../../story/data";

const utils = new FirestoreContextUtils("form_writer");
const storyForms = utils.storyForms;
const storyQuestions = utils.storyQuestions;

describe("FirebaseStoryFormWriter", () => {
  let questionsWriter: FirebaseStoryQuestionWriter;
  let formWriter: FirebaseStoryFormWriter;

  // Check we are running in emulator mode before initializing Firebase.
  beforeAll(() => {
    initEnv();
    initFirebase(true);
    questionsWriter = new FirebaseStoryQuestionWriter(storyQuestions);
    formWriter = new FirebaseStoryFormWriter(
      storyForms,
      new FirebaseStoryQuestionReader(storyQuestions)
    );
  });

  // Empty the forms and questions collection, then recreate some questions.
  beforeEach(async () => {
    await storyQuestions.delete();
    await storyForms.delete();

    await questionsWriter.write(ALL_QUESTIONS);
  });

  test("Simple write", async () => {
    await formWriter.write(FORM_0);

    await storyForms.expectCountToBe(1);
    await storyForms.expectToBe([SERIALIZED_FORM_0]);
  });

  test("Write two forms", async () => {
    await formWriter.write(FORM_0);
    await formWriter.write(FORM_1);

    await storyForms.expectCountToBe(2);
    await storyForms.expectToBe([SERIALIZED_FORM_0, SERIALIZED_FORM_1]);
  });

  test("Incompatible question ID", async () => {
    await expect(formWriter.write(FORM_2)).rejects.toThrow(
      'FirebaseStoryFormWriter.write: question "doesnotexistV1" does not exist'
    );
    await storyForms.expectCountToBe(0);
  });

  test("Incompatible choice ID", async () => {
    await expect(formWriter.write(FORM_3)).rejects.toThrow(
      "StoryQuestion.copyWithChoices: invalid choice IDs provided: doesnotexist"
    );
    await storyForms.expectCountToBe(0);
  });
});
