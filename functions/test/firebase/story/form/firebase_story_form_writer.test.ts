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
  DUMMY_QUESTIONS,
  DUMMY_FORM_0,
  DUMMY_FORM_1,
  DUMMY_FORM_2,
  DUMMY_FORM_3,
  SERIALIZED_DUMMY_FORM_0,
  SERIALIZED_DUMMY_FORM_1,
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

    await questionsWriter.write(DUMMY_QUESTIONS);
  });

  test("Simple write", async () => {
    await formWriter.write(DUMMY_FORM_0);

    await storyForms.expectCountToBe(1);
    await storyForms.expectToBe([SERIALIZED_DUMMY_FORM_0]);
  });

  test("Write two forms", async () => {
    await formWriter.write(DUMMY_FORM_0);
    await formWriter.write(DUMMY_FORM_1);

    await storyForms.expectCountToBe(2);
    await storyForms.expectToBe([
      SERIALIZED_DUMMY_FORM_0,
      SERIALIZED_DUMMY_FORM_1,
    ]);
  });

  test("Incompatible question ID", async () => {
    await expect(formWriter.write(DUMMY_FORM_2)).rejects.toThrow(
      'FirebaseStoryFormWriter.write: question "doesnotexistV1" does not exist'
    );
    await storyForms.expectCountToBe(0);
  });

  test("Incompatible choice ID", async () => {
    await expect(formWriter.write(DUMMY_FORM_3)).rejects.toThrow(
      "StoryQuestion.copyWithChoices: invalid choice IDs provided: doesnotexist"
    );
    await storyForms.expectCountToBe(0);
  });

  test("writeIsGenerated", async () => {
    const id = await formWriter.write(DUMMY_FORM_0);
    await formWriter.writeIsGenerated(id);

    await storyForms.expectIsGenerated(id);
  });

  test("writeIsApproved", async () => {
    const id = await formWriter.write(DUMMY_FORM_0);
    await formWriter.writeIsApproved(id);

    await storyForms.expectIsApproved(id);
  });
});
