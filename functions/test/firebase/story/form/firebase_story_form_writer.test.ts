import { beforeAll, expect, beforeEach, test, describe } from "@jest/globals";
import {
  initEnv,
  initFirebase,
  FirebaseStoryFormWriter,
  FirebaseStoryQuestionWriter,
  FirebaseStoryQuestionReader,
  FirebaseStoryWriter,
  FirebaseStoryReader,
} from "../../../../src/firebase";
import { FirestoreContextUtils } from "../../utils";
import {
  DUMMY_QUESTIONS,
  DUMMY_FORM_0,
  DUMMY_FORM_1,
  DUMMY_FORM_2,
  DUMMY_FORM_3,
  SERIALIZED_DUMMY_FORM_0,
  SERIALIZED_DUMMY_FORM_1,
  CLASSIC_LOGIC_0,
  GENERATOR_0,
} from "../../../story/data";
import { StoryMetadata } from "../../../../src/story";

const utils = new FirestoreContextUtils("form_writer");
const storyCacheLanding = utils.storyCacheLanding;
const storyForms = utils.storyForms;
const storyQuestions = utils.storyQuestions;

describe("FirebaseStoryFormWriter", () => {
  let questionsWriter: FirebaseStoryQuestionWriter;
  let formWriter: FirebaseStoryFormWriter;

  // Check we are running in emulator mode before initializing Firebase.
  beforeAll(() => {
    initEnv();
    initFirebase(true);
    questionsWriter = new FirebaseStoryQuestionWriter(storyQuestions);
    formWriter = new FirebaseStoryFormWriter(
      storyForms,
      new FirebaseStoryQuestionReader(storyQuestions),
      new FirebaseStoryReader(storyCacheLanding)
    );
  });

  // Empty the forms and questions collection, then recreate some questions.
  beforeEach(async () => {
    await storyQuestions.delete();
    await storyForms.delete();
    await storyCacheLanding.delete();

    await questionsWriter.write(DUMMY_QUESTIONS);
  });

  test("Simple write", async () => {
    await formWriter.write(DUMMY_FORM_0);

    await storyForms.expectCountToBe(1);
    await storyForms.expectToBe([SERIALIZED_DUMMY_FORM_0]);
  });

  test("Write two forms", async () => {
    await formWriter.write(DUMMY_FORM_0);
    await formWriter.write(DUMMY_FORM_1);

    await storyForms.expectCountToBe(2);
    await storyForms.expectToBe([
      SERIALIZED_DUMMY_FORM_0,
      SERIALIZED_DUMMY_FORM_1,
    ]);
  });

  test("Incompatible question ID", async () => {
    await expect(formWriter.write(DUMMY_FORM_2)).rejects.toThrow(
      'storyFormToFirestore: question "doesnotexistV1" does not exist'
    );
    await storyForms.expectCountToBe(0);
  });

  test("Incompatible choice ID", async () => {
    await expect(formWriter.write(DUMMY_FORM_3)).rejects.toThrow(
      "StoryQuestion.copyWithChoices: invalid choice IDs provided: doesnotexist"
    );
    await storyForms.expectCountToBe(0);
  });

  test("writeIsCached", async () => {
    const id = await formWriter.write(DUMMY_FORM_0);
    await formWriter.writeIsCached(id);

    await storyForms.expectIsCached(id);
  });

  test("approveForm", async () => {
    const formId = await formWriter.write(DUMMY_FORM_0);

    const metadata_0_0 = new StoryMetadata("author0", {
      formId: formId,
      characterName: "frosty",
      characterFlaw: "failure",
      characterChallenge: "animal",
    });

    const metadata_0_1 = new StoryMetadata("author1", {
      formId: formId, // Same form.
      characterName: "frosty",
      characterFlaw: "lazy",
      characterChallenge: "animal",
    });

    const writer_0 = new FirebaseStoryWriter(storyCacheLanding);
    await writer_0.writeInit(metadata_0_0);
    await writer_0.writeFromGenerator(CLASSIC_LOGIC_0, GENERATOR_0);

    const writer_1 = new FirebaseStoryWriter(storyCacheLanding);
    await writer_1.writeInit(metadata_0_1);
    await writer_1.writeFromGenerator(CLASSIC_LOGIC_0, GENERATOR_0);

    await expect(formWriter.approveForm(formId)).rejects.toThrowError(
      `approveForm: form ${formId} cannot be approved as some images in the stories collection are still not approved.`
    );

    const storyReader = new FirebaseStoryReader(storyCacheLanding);
    const imageIds = await storyReader.getFormStoryImageIds(formId);
    await writer_0.approveImage(imageIds[0].storyId, imageIds[0].imageId);
    await expect(formWriter.approveForm(formId)).rejects.toThrowError(
      `approveForm: form ${formId} cannot be approved as some images in the stories collection are still not approved.`
    );

    await writer_0.approveImage(imageIds[1].storyId, imageIds[1].imageId);
    await formWriter.approveForm(formId);

    await storyForms.expectIsApproved(formId);
  }, 60000);
});
