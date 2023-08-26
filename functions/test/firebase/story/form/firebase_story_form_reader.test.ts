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
  DUMMY_QUESTIONS,
  DUMMY_QUESTIONS_0,
  SERIALIZED_DUMMY_FORM_0,
  SERIALIZED_DUMMY_FORM_1,
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

  test("readNotGenerated", async () => {
    const writer = new FirebaseStoryQuestionWriter(storyQuestions);
    await writer.write(DUMMY_QUESTIONS);

    await storyForms.formsRef().add(SERIALIZED_DUMMY_FORM_0);
    const form1 = await storyForms.formsRef().add(SERIALIZED_DUMMY_FORM_1);
    await form1.update({ isGenerated: true });

    const reader = new FirebaseStoryFormReader(
      storyForms,
      new FirebaseStoryQuestionReader(storyQuestions)
    );

    const forms = await reader.readNotGenerated();
    expect(forms).toEqual([DUMMY_FORM_0]);
  });

  test("readNotGeneratedWithIds", async () => {
    const writer = new FirebaseStoryQuestionWriter(storyQuestions);
    await writer.write(DUMMY_QUESTIONS);

    const form0 = await storyForms.formsRef().add(SERIALIZED_DUMMY_FORM_0);
    const form1 = await storyForms.formsRef().add(SERIALIZED_DUMMY_FORM_1);
    await form1.update({ isGenerated: true });

    const reader = new FirebaseStoryFormReader(
      storyForms,
      new FirebaseStoryQuestionReader(storyQuestions)
    );

    const forms = await reader.readNotGeneratedWithIds();
    expect(forms).toEqual(new Map([[form0.id, DUMMY_FORM_0]]));
  });
});
