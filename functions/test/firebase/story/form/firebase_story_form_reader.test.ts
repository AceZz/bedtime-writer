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

  test("readNotCached", async () => {
    const writer = new FirebaseStoryQuestionWriter(storyQuestions);
    await writer.write(DUMMY_QUESTIONS);

    await storyForms.formsRef().add(SERIALIZED_DUMMY_FORM_0);
    const form1 = await storyForms.formsRef().add(SERIALIZED_DUMMY_FORM_1);
    await form1.update({ isCached: true });

    const reader = new FirebaseStoryFormReader(
      storyForms,
      new FirebaseStoryQuestionReader(storyQuestions)
    );

    const forms = await reader.readNotCached();
    expect(forms).toEqual([DUMMY_FORM_0]);
  });

  test("readNotCachedWithIds", async () => {
    const writer = new FirebaseStoryQuestionWriter(storyQuestions);
    await writer.write(DUMMY_QUESTIONS);

    const form0 = await storyForms.formsRef().add(SERIALIZED_DUMMY_FORM_0);
    const form1 = await storyForms.formsRef().add(SERIALIZED_DUMMY_FORM_1);
    await form1.update({ isCached: true });

    const reader = new FirebaseStoryFormReader(
      storyForms,
      new FirebaseStoryQuestionReader(storyQuestions)
    );

    const forms = await reader.readNotCachedWithIds();
    expect(forms).toEqual(new Map([[form0.id, DUMMY_FORM_0]]));
  });

  test("readCachedNotApprovedIds", async () => {
    const form0 = await storyForms.formsRef().add(SERIALIZED_DUMMY_FORM_0);
    await form0.update({ isCached: true });
    const form1 = await storyForms.formsRef().add(SERIALIZED_DUMMY_FORM_1);
    await form1.update({ isCached: true, isApproved: true });

    const reader = new FirebaseStoryFormReader(storyForms);

    const forms = await reader.readCachedNotApprovedIds();
    expect(forms).toEqual([form0.id]);
  });
});
