import { beforeAll, beforeEach, describe, expect, test } from "@jest/globals";
import {
  FirebaseStoryFormReader,
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

  test("All forms", async () => {
    await storyQuestions.write(DUMMY_QUESTIONS_0);

    const doc = await storyForms.formsRef().add(SERIALIZED_DUMMY_FORM_0);

    const reader = new FirebaseStoryFormReader(storyForms, storyQuestions);

    expect(await reader.get()).toEqual(new Map([[doc.id, DUMMY_FORM_0]]));
    expect(await reader.getIds()).toEqual([doc.id]);
  });

  test("get() no questions throws", async () => {
    await storyForms.formsRef().add(SERIALIZED_DUMMY_FORM_0);
    const reader = new FirebaseStoryFormReader(storyForms, storyQuestions);
    expect(reader.get).rejects.toThrow();
  });

  test("Not cached", async () => {
    await storyQuestions.write(DUMMY_QUESTIONS);

    const form0 = await storyForms.formsRef().add(SERIALIZED_DUMMY_FORM_0);
    const form1 = await storyForms.formsRef().add(SERIALIZED_DUMMY_FORM_1);
    await form1.update({ isCached: true });

    const reader = new FirebaseStoryFormReader(storyForms, storyQuestions);

    const params = { isCached: false };
    expect(await reader.get(params)).toEqual(
      new Map([[form0.id, DUMMY_FORM_0]])
    );
    expect(await reader.getIds(params)).toEqual([form0.id]);
  });

  test("Cached and not approved", async () => {
    const form0 = await storyForms.formsRef().add(SERIALIZED_DUMMY_FORM_0);
    await form0.update({ isCached: true });
    const form1 = await storyForms.formsRef().add(SERIALIZED_DUMMY_FORM_1);
    await form1.update({ isCached: true, isApproved: true });

    const reader = new FirebaseStoryFormReader(storyForms, storyQuestions);

    const params = { isCached: true, isApproved: false };
    expect(await reader.get(params)).toEqual(
      new Map([[form0.id, DUMMY_FORM_0]])
    );
    expect(await reader.getIds(params)).toEqual([form0.id]);
  });
});
