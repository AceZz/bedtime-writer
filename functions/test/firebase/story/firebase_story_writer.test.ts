import { beforeAll, beforeEach, describe, test } from "@jest/globals";
import {
  initEnv,
  initFirebase,
  FirebaseStoryWriter,
  FirebaseStoryReader,
} from "../../../src/firebase";
import { FirestoreContextUtils } from "../utils";
import {
  CLASSIC_LOGIC_0,
  FAKE_TEXT_API,
  GENERATOR_0,
  METADATA_0,
} from "../../story/data";
import { FakeImageApi, FAKE_IMAGE_BYTES_1 } from "../../../src/fake";
import { StoryRegenImageStatus } from "../../../src/story";

const storyRealtime = new FirestoreContextUtils("story_writer").storyRealtime;
const storyCacheLanding = new FirestoreContextUtils("story_writer")
  .storyCacheLanding;

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

  describe("Methods for story review", () => {
    const SEED_1 = 1;

    beforeEach(async () => {
      await storyCacheLanding.delete();
    });

    test("should regenerate one image", async () => {
      const writer = new FirebaseStoryWriter(storyCacheLanding);
      const storyId = await writer.writeInit(METADATA_0);
      await writer.writeFromGenerator(CLASSIC_LOGIC_0, GENERATOR_0);
      const reader = new FirebaseStoryReader(storyCacheLanding);
      const imageId = (await reader.getImageIds(storyId))[0];

      const imageApi = new FakeImageApi(SEED_1);
      await writer.regenImage(storyId, imageId, imageApi);

      await storyCacheLanding.expectImageToBe(
        storyId,
        imageId,
        FAKE_IMAGE_BYTES_1
      );
      await storyCacheLanding.expectImageRegenStatusToBe(
        storyId,
        imageId,
        StoryRegenImageStatus.COMPLETE
      );
    }, 20000);

    test("should approve image when called after caching step", async () => {
      const writer = new FirebaseStoryWriter(storyCacheLanding);
      const storyId = await writer.writeInit(METADATA_0);
      await writer.writeFromGenerator(CLASSIC_LOGIC_0, GENERATOR_0);
      const reader = new FirebaseStoryReader(storyCacheLanding);
      const imageId = (await reader.getImageIds(storyId))[0];
      await storyCacheLanding.expectImageToNotBeApproved(storyId, imageId);

      await writer.approveImage(storyId, imageId);

      await storyCacheLanding.expectImageToBeApproved(storyId, imageId);
    }, 20000);
  });
});
