import { beforeAll, beforeEach, test } from "@jest/globals";
import { initEnv, initFirebase } from "../../../src/firebase";
import { FirestoreTestUtils } from "../utils/firestore_test_utils";
import { FirebaseStoryWriter } from "../../../src/story";
import { GENERATOR_0, METADATA_0, STORY_ID_0 } from "../data";

const firestoreStory = new FirestoreTestUtils("story_writer").story;

// Check we are running in emulator mode before initializing Firebase.
beforeAll(() => {
  initEnv();
  initFirebase(true);
});

beforeEach(async () => {
  await firestoreStory.delete();
});

test("Write from generator", async () => {
  // Normally requestManager does this
  await firestoreStory.storyRef(STORY_ID_0).create({});

  const writer = new FirebaseStoryWriter(
    firestoreStory,
    METADATA_0,
    STORY_ID_0
  );
  await writer.writeFromGenerator(GENERATOR_0);

  await firestoreStory.expectMetadata(STORY_ID_0, METADATA_0);
  await firestoreStory.expectParts(STORY_ID_0);
  await firestoreStory.expectComplete(STORY_ID_0);
}, 20000);
