import { beforeAll, beforeEach, test } from "@jest/globals";
import { initEnv, initFirebase } from "../../../src/firebase";
import { FirestoreTestUtils } from "../utils/firestore_test_utils";

const storyUtils = new FirestoreTestUtils("story_writer").story;

// Check we are running in emulator mode before initializing Firebase.
beforeAll(() => {
  initEnv();
  initFirebase(true);
});

beforeEach(async () => {
  await storyUtils.deleteCollection();
});

test("Write from generator", async () => {
  const writer = storyUtils.writer;
  const generator = storyUtils.generator;
  await storyUtils.createDoc(); // Normally requestManager does this

  await writer.writeFromGenerator(generator);

  await storyUtils.expectMetadata();
  await storyUtils.expectParts();
  await storyUtils.expectComplete();
}, 20000);
