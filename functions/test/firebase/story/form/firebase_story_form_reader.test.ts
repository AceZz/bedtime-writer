import { beforeAll, beforeEach, describe, expect, test } from "@jest/globals";
import {
  FirebaseStoryFormReader,
  FirebaseStoryQuestionReader,
  FirebaseStoryQuestionWriter,
  initEnv,
  initFirebase,
} from "../../../../src/firebase";
import { FirestoreContextUtils } from "../../utils";
import {
  DUMMY_FORM_0,
  DUMMY_QUESTIONS_0,
  SERIALIZED_DUMMY_FORM_0,
} from "../../../story/data";

const context = new FirestoreContextUtils("form_reader");
const storyForms = context.storyForms;
const storyQuestions = context.storyQuestions;

describe("FirebaseStoryFormReader", () => {
  // Check we are running in emulator mode before initializing Firebase.
  beforeAll(() => {
    initEnv();
    initFirebase(true);
  });

  beforeEach(async () => await storyForms.delete());

  test("readAll", async () => {
    const writer = new FirebaseStoryQuestionWriter(storyQuestions);
    await writer.write(DUMMY_QUESTIONS_0);

    await storyForms.formsRef().add(SERIALIZED_DUMMY_FORM_0);

    const reader = new FirebaseStoryFormReader(
      storyForms,
      new FirebaseStoryQuestionReader(storyQuestions)
    );
    const forms = await reader.readAll();

    expect(forms).toEqual([DUMMY_FORM_0]);
  });

  test("readAll no questions throws", async () => {
    await storyForms.formsRef().add(SERIALIZED_DUMMY_FORM_0);
    const reader = new FirebaseStoryFormReader(
      storyForms,
      new FirebaseStoryQuestionReader(storyQuestions)
    );
    expect(reader.readAll).rejects.toThrow();
  });
});
