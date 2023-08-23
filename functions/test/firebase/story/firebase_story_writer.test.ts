import { beforeAll, beforeEach, test } from "@jest/globals";
import {
  initEnv,
  initFirebase,
  FirebaseStoryWriter,
} from "../../../src/firebase";
import { FirestoreContextUtils } from "../utils";
import { GENERATOR_0, METADATA_0, STORY_ID_0 } from "../../story/data";

const storyRealtime = new FirestoreContextUtils("story_writer").storyRealtime;

// Check we are running in emulator mode before initializing Firebase.
beforeAll(() => {
  initEnv();
  initFirebase(true);
});

beforeEach(async () => {
  await storyRealtime.delete();
});

test("Write from generator", async () => {
  // Normally requestManager does this
  await storyRealtime.storyRef(STORY_ID_0).create({});

  const writer = new FirebaseStoryWriter(storyRealtime, METADATA_0, STORY_ID_0);
  await writer.writeFromGenerator(GENERATOR_0);

  await storyRealtime.expectMetadata(STORY_ID_0, METADATA_0);
  await storyRealtime.expectParts(STORY_ID_0);
  await storyRealtime.expectComplete(STORY_ID_0);
}, 20000);
