import { beforeAll, beforeEach, describe, expect, test } from "@jest/globals";
import {
  FirebaseStoryQuestionWriter,
  initEnv,
  initFirebase,
} from "../../../../src/firebase";
import { FirestoreContextUtils } from "../../../firebase/utils";
import { FORM_0, QUESTIONS_0, SERIALIZED_FORM_0 } from "../../data";
import { FirebaseFormReader } from "../../../../src/story";

const context = new FirestoreContextUtils("form_reader");
const storyForms = context.storyForms;
const storyQuestions = context.storyQuestions;

describe("FirebaseFormReader", () => {
  // Check we are running in emulator mode before initializing Firebase.
  beforeAll(() => {
    initEnv();
    initFirebase(true);
  });

  beforeEach(async () => await storyForms.delete());

  test("read", async () => {
    const writer = new FirebaseStoryQuestionWriter(storyQuestions);
    await writer.write(await QUESTIONS_0());

    await storyForms.formsRef().add(SERIALIZED_FORM_0);

    const reader = new FirebaseFormReader(storyForms, storyQuestions);
    const forms = await reader.read();

    expect(forms).toEqual([await FORM_0()]);
  });

  test("read no questions throws", async () => {
    await storyForms.formsRef().add(SERIALIZED_FORM_0);
    const reader = new FirebaseFormReader(storyForms, storyQuestions);
    expect(reader.read).rejects.toThrow();
  });
});
