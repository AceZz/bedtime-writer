import { beforeAll, beforeEach, describe, test } from "@jest/globals";
import {
  initEnv,
  initFirebase,
  FirebaseStoryWriter,
} from "../../../src/firebase";
import { FirestoreContextUtils } from "../utils";
import {
  CLASSIC_LOGIC_0,
  FAKE_TEXT_API,
  GENERATOR_0,
  METADATA_0,
} from "../../story/data";

const storyRealtime = new FirestoreContextUtils("story_writer").storyRealtime;

describe("FirebaseStoryWriter", () => {
  const numImages = 1;

  beforeAll(() => {
    initEnv();
    initFirebase(true);
  });

  beforeEach(async () => {
    await storyRealtime.delete();
  });

  test("writeInit", async () => {
    const writer = new FirebaseStoryWriter(storyRealtime);
    const id = await writer.writeInit(METADATA_0);

    await storyRealtime.expectInitMetadata(id, METADATA_0);

    await storyRealtime.expectParts(id, 0, 0);
  }, 20000);

  test("writeFromGenerator with the same writer", async () => {
    const writer = new FirebaseStoryWriter(storyRealtime);
    const id = await writer.writeInit(METADATA_0);
    await storyRealtime.expectInitMetadata(id, METADATA_0);

    await writer.writeFromGenerator(CLASSIC_LOGIC_0, GENERATOR_0);

    await storyRealtime.expectParts(id, FAKE_TEXT_API.numParts, numImages);
  }, 20000);

  test("writeInit and writeFromGenerator with two writers", async () => {
    const writer1 = new FirebaseStoryWriter(storyRealtime);
    const id = await writer1.writeInit(METADATA_0);
    await storyRealtime.expectInitMetadata(id, METADATA_0);

    const writer2 = new FirebaseStoryWriter(storyRealtime, id);
    await writer2.writeFromGenerator(CLASSIC_LOGIC_0, GENERATOR_0);

    await storyRealtime.expectParts(id, FAKE_TEXT_API.numParts, numImages);
  }, 20000);

  test("writeFromGenerator twice removes first parts", async () => {
    const writer = new FirebaseStoryWriter(storyRealtime);
    const id = await writer.writeInit(METADATA_0);

    await writer.writeFromGenerator(CLASSIC_LOGIC_0, GENERATOR_0);
    await storyRealtime.expectParts(id, FAKE_TEXT_API.numParts, numImages);

    await writer.writeFromGenerator(CLASSIC_LOGIC_0, GENERATOR_0);
    await storyRealtime.expectParts(id, FAKE_TEXT_API.numParts, numImages);
  }, 30000);
});
