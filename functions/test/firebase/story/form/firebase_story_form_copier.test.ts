import { beforeAll, beforeEach, describe, expect, test } from "@jest/globals";
import {
  FirebaseStoryFormCopier,
  FirebaseStoryFormWriter,
  dumpCollection,
  initEnv,
  initFirebase,
} from "../../../../src/firebase";
import { FirestoreContextUtils } from "../../utils";
import {
  DUMMY_FORM_0,
  DUMMY_FORM_1,
  DUMMY_QUESTIONS,
  SERIALIZED_DUMMY_FORM_0,
  SERIALIZED_DUMMY_FORM_1,
} from "../../../story/data";

const origin = new FirestoreContextUtils("form_copier_origin");
const originQuestions = origin.storyQuestions;
const originForms = origin.storyForms;
const dest = new FirestoreContextUtils("form_copier_dest").storyForms;

describe("FirebaseStoryFormCopier", () => {
  let formWriter: FirebaseStoryFormWriter;

  beforeAll(() => {
    initEnv();
    initFirebase(true);
    formWriter = new FirebaseStoryFormWriter(originForms);
  });

  beforeEach(async () => {
    await originQuestions.delete();
    await originForms.delete();
    await dest.delete();
  });

  test("copy() all", async () => {
    await originQuestions.write(DUMMY_QUESTIONS);
    await formWriter.write(DUMMY_FORM_0);
    await formWriter.write(DUMMY_FORM_1);

    const copier = new FirebaseStoryFormCopier(
      (form) => form,
      originQuestions,
      originForms,
      dest
    );
    await copier.copy();

    await dest.expectToBe([SERIALIZED_DUMMY_FORM_0, SERIALIZED_DUMMY_FORM_1]);
  });

  test("copy() filtered", async () => {
    await originQuestions.write(DUMMY_QUESTIONS);
    const id_0 = await formWriter.write(DUMMY_FORM_0);
    const id_1 = await formWriter.write(DUMMY_FORM_1);

    const copier = new FirebaseStoryFormCopier(
      (form) => {
        return {
          question: form.question0,
        };
      },
      originQuestions,
      originForms,
      dest
    );
    await copier.copy();

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
    await originQuestions.write(DUMMY_QUESTIONS);
    const id_0 = await formWriter.write(DUMMY_FORM_0);
    await formWriter.write(DUMMY_FORM_1);

    const copier = new FirebaseStoryFormCopier(
      (form) => form,
      originQuestions,
      originForms,
      dest
    );
    await copier.copy({ ids: [id_0] });

    await dest.expectToBe([SERIALIZED_DUMMY_FORM_0]);
  });
});
