import { beforeAll, beforeEach, expect, test } from "@jest/globals";
import { initEnv, initFirebase } from "../../../../src/firebase";
import { FirestoreContextUtils } from "../../../firebase/utils";
import {
  FORM_0,
  FORM_1,
  SERIALIZED_FORM_0,
  SERIALIZED_FORM_1,
} from "../../data";
import { FirebaseFormReader } from "../../../../src/story";

const storyForms = new FirestoreContextUtils("form_reader").storyForms;

// Check we are running in emulator mode before initializing Firebase.
beforeAll(() => {
  initEnv();
  initFirebase(true);
});

beforeEach(async () => await storyForms.delete());

test("FirebaseFormReader", async () => {
  await storyForms.formsRef().add(SERIALIZED_FORM_0);
  await storyForms.formsRef().add(SERIALIZED_FORM_1);

  const reader = new FirebaseFormReader(storyForms);
  const forms = await reader.read();
  forms.sort((a, b) => a.start.getTime() - b.start.getTime());

  expect(forms).toStrictEqual([FORM_0, FORM_1]);
});
