import { beforeAll, expect, beforeEach, test } from "@jest/globals";
import { initEnv, initFirebase } from "../../../src/firebase/utils";
import { FirestoreTestUtils } from "../utils/firestore_test_utils";

const utils = new FirestoreTestUtils("form_writer");

// Check we are running in emulator mode before initializing Firebase.
beforeAll(() => {
  initEnv();
  initFirebase(true);
});

// Empty the forms and questions collection, then recreate some questions.
beforeEach(async () => {
  await utils.questions.deleteCollection();
  await utils.forms.deleteCollection();

  const questions = await utils.questions.samples();
  await utils.questions.writer.write(questions[0]);
});

test("Simple write", async () => {
  const forms = utils.forms.samples();
  await utils.forms.writer.write(forms[0]);

  const serializedForms = utils.forms.serializedSamples();
  await utils.forms.expectCountToBe(1);
  await utils.forms.expectToBe([serializedForms[0]]);
});

test("Write two forms in right order", async () => {
  const forms = utils.forms.samples();

  await utils.forms.writer.write(forms[0]);
  await utils.forms.writer.write(forms[1]);

  const serializedForms = utils.forms.serializedSamples();
  await utils.forms.expectCountToBe(2);
  await utils.forms.expectToBe([serializedForms[0], serializedForms[1]]);
});

test("Write two forms in wrong order", async () => {
  const forms = utils.forms.samples();

  await utils.forms.writer.write(forms[1]);
  await expect(utils.forms.writer.write(forms[0])).rejects.toThrow(
    "another form starts before"
  );

  const serializedForms = utils.forms.serializedSamples();
  await utils.forms.expectCountToBe(1);
  await utils.forms.expectToBe([serializedForms[1]]);
});

test("Incompatible question ID", async () => {
  const forms = utils.forms.samples();
  await expect(utils.forms.writer.write(forms[2])).rejects.toThrow(
    'Question "doesnotexist" does not exist'
  );
  await utils.forms.expectCountToBe(0);
});

test("Incompatible choice ID", async () => {
  const forms = utils.forms.samples();
  await expect(utils.forms.writer.write(forms[3])).rejects.toThrow(
    'Choice "doesnotexist" for question "question1" does not exist.'
  );
  await utils.forms.expectCountToBe(0);
});
