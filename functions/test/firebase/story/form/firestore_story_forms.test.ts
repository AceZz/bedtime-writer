import { beforeAll, beforeEach, describe, expect, test } from "@jest/globals";
import {
  dumpCollection,
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

const context = new FirestoreContextUtils("firestore_story_forms");
const storyForms = context.storyForms;
const storyQuestions = context.storyQuestions;
const dest = new FirestoreContextUtils("firestore_story_forms_dest").storyForms;

describe("FirestoreStoryForms", () => {
  beforeAll(() => {
    initEnv();
    initFirebase(true);
  });

  beforeEach(async () => {
    await storyForms.delete();
    await dest.delete();
  });

  test("All forms", async () => {
    await storyQuestions.write(DUMMY_QUESTIONS_0);

    const doc = await storyForms.formsRef().add(SERIALIZED_DUMMY_FORM_0);

    expect(await storyForms.get()).toEqual(new Map([[doc.id, DUMMY_FORM_0]]));
    expect(await storyForms.getIds()).toEqual([doc.id]);
  });

  test("get() no questions throws", async () => {
    await storyForms.formsRef().add(SERIALIZED_DUMMY_FORM_0);
    expect(storyForms.get).rejects.toThrow();
  });

  test("Not cached", async () => {
    await storyQuestions.write(DUMMY_QUESTIONS);

    const form0 = await storyForms.formsRef().add(SERIALIZED_DUMMY_FORM_0);
    const form1 = await storyForms.formsRef().add(SERIALIZED_DUMMY_FORM_1);
    await form1.update({ isCached: true });

    const params = { isCached: false };
    expect(await storyForms.get(params)).toEqual(
      new Map([[form0.id, DUMMY_FORM_0]])
    );
    expect(await storyForms.getIds(params)).toEqual([form0.id]);
  });

  test("Cached and not approved", async () => {
    const form0 = await storyForms.formsRef().add(SERIALIZED_DUMMY_FORM_0);
    await form0.update({ isCached: true });
    const form1 = await storyForms.formsRef().add(SERIALIZED_DUMMY_FORM_1);
    await form1.update({ isCached: true, isApproved: true });

    const params = { isCached: true, isApproved: false };
    expect(await storyForms.get(params)).toEqual(
      new Map([[form0.id, DUMMY_FORM_0]])
    );
    expect(await storyForms.getIds(params)).toEqual([form0.id]);
  });

  test("copy() all", async () => {
    await storyQuestions.write(DUMMY_QUESTIONS);
    await storyForms.formsRef().add(SERIALIZED_DUMMY_FORM_0);
    await storyForms.formsRef().add(SERIALIZED_DUMMY_FORM_1);

    await storyForms.copy(dest, (form) => form);

    await dest.expectToBe([SERIALIZED_DUMMY_FORM_0, SERIALIZED_DUMMY_FORM_1]);
  });

  test("copy() filtered", async () => {
    await storyQuestions.write(DUMMY_QUESTIONS);
    const id_0 = (await storyForms.formsRef().add(SERIALIZED_DUMMY_FORM_0)).id;
    const id_1 = (await storyForms.formsRef().add(SERIALIZED_DUMMY_FORM_1)).id;

    await storyForms.copy(dest, (form) => {
      return {
        question: form.question0,
      };
    });

    const actual = await dumpCollection(dest);
    expect(actual).toEqual(
      new Map([
        [
          id_0,
          {
            question: "question1V1",
          },
        ],
        [
          id_1,
          {
            question: "question1V1",
          },
        ],
      ])
    );
  });

  test("copy() ids", async () => {
    await storyQuestions.write(DUMMY_QUESTIONS);
    const id_0 = (await storyForms.formsRef().add(SERIALIZED_DUMMY_FORM_0)).id;
    await storyForms.formsRef().add(SERIALIZED_DUMMY_FORM_1);

    await storyForms.copy(dest, (form) => form, { ids: [id_0] });

    await dest.expectToBe([SERIALIZED_DUMMY_FORM_0]);
  });
});
