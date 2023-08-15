import { beforeAll, expect, beforeEach, test, describe } from "@jest/globals";
import { initEnv, initFirebase } from "../../../../src/firebase";
import { FirestoreTestUtils } from "../../utils/firestore_test_utils";
import {
  FORM_0,
  FORM_1,
  FORM_2,
  FORM_3,
  QUESTIONS_0,
  SERIALIZED_FORM_0,
  SERIALIZED_FORM_1,
} from "../../data";
import {
  FirebaseFormWriter,
  FirebaseQuestionWriter,
} from "../../../../src/story";

const utils = new FirestoreTestUtils("form_writer");

describe("FirebaseFormWriter", () => {
  let questionsWriter: FirebaseQuestionWriter;
  let formWriter: FirebaseFormWriter;

  // Check we are running in emulator mode before initializing Firebase.
  beforeAll(() => {
    initEnv();
    initFirebase(true);
    questionsWriter = new FirebaseQuestionWriter(utils.questions);
    formWriter = new FirebaseFormWriter(
      utils.forms.firestoreForms,
      utils.forms.firestoreQuestions
    );
  });

  // Empty the forms and questions collection, then recreate some questions.
  beforeEach(async () => {
    await utils.questions.delete();
    await utils.forms.deleteCollection();

    await questionsWriter.write(await QUESTIONS_0());
  });

  test("Simple write", async () => {
    await formWriter.write(FORM_0);

    await utils.forms.expectCountToBe(1);
    await utils.forms.expectToBe([SERIALIZED_FORM_0]);
  });

  test("Write two forms in right order", async () => {
    await formWriter.write(FORM_0);
    await formWriter.write(FORM_1);

    await utils.forms.expectCountToBe(2);
    await utils.forms.expectToBe([SERIALIZED_FORM_0, SERIALIZED_FORM_1]);
  });

  test("Write two forms in wrong order", async () => {
    await formWriter.write(FORM_1);
    await expect(formWriter.write(FORM_0)).rejects.toThrow(
      "another form starts before"
    );

    await utils.forms.expectCountToBe(1);
    await utils.forms.expectToBe([SERIALIZED_FORM_1]);
  });

  test("Incompatible question ID", async () => {
    await expect(formWriter.write(FORM_2)).rejects.toThrow(
      'Question "doesnotexist" does not exist'
    );
    await utils.forms.expectCountToBe(0);
  });

  test("Incompatible choice ID", async () => {
    await expect(formWriter.write(FORM_3)).rejects.toThrow(
      'Choice "doesnotexist" for question "question1V1" does not exist.'
    );
    await utils.forms.expectCountToBe(0);
  });
});
