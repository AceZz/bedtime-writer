import { beforeAll, beforeEach, describe, expect, test } from "@jest/globals";
import {
  initEnv,
  initFirebase,
  FirebaseStoryWriter,
  FirebaseStoryReader,
} from "../../../src/firebase";
import { FirestoreContextUtils } from "../utils";
import { CLASSIC_LOGIC_0, GENERATOR_0, METADATA_0 } from "../../story/data";
import { StoryMetadata, StoryStatus } from "../../../src/story";
import { DUMMY_IMAGE_PROMPT, DUMMY_STORY_PART } from "../../story/data/stories";

const storyRealtime = new FirestoreContextUtils("story_reader").storyRealtime;

describe("FirebaseStoryReader", () => {
  beforeAll(() => {
    initEnv();
    initFirebase(true);
  });

  beforeEach(async () => {
    await storyRealtime.delete();
  });

  test("countAll", async () => {
    const writer_0 = new FirebaseStoryWriter(storyRealtime);
    await writer_0.writeInit(METADATA_0);
    await writer_0.writeFromGenerator(CLASSIC_LOGIC_0, GENERATOR_0);

    const writer_1 = new FirebaseStoryWriter(storyRealtime);
    await writer_1.writeInit(METADATA_0);
    await writer_1.writeFromGenerator(CLASSIC_LOGIC_0, GENERATOR_0);

    const reader = new FirebaseStoryReader(storyRealtime);
    expect(await reader.countAll()).toBe(2);
  });

  test("readFormStories", async () => {
    const metadata_0_0 = new StoryMetadata("author0", {
      formId: "form0",
      characterName: "frosty",
      characterFlaw: "failure",
      characterChallenge: "animal",
    });

    const metadata_0_1 = new StoryMetadata("author1", {
      formId: "form0", // Same form.
      characterName: "frosty",
      characterFlaw: "failure",
      characterChallenge: "animal",
    });

    const metadata_1_0 = new StoryMetadata("author2", {
      formId: "form1", // Another form.
      characterName: "frosty",
      characterFlaw: "failure",
      characterChallenge: "animal",
    });

    const writer_0 = new FirebaseStoryWriter(storyRealtime);
    const id_0 = await writer_0.writeInit(metadata_0_0);
    await writer_0.writeFromGenerator(CLASSIC_LOGIC_0, GENERATOR_0);

    const writer_1 = new FirebaseStoryWriter(storyRealtime);
    const id_1 = await writer_1.writeInit(metadata_0_1);
    await writer_1.writeFromGenerator(CLASSIC_LOGIC_0, GENERATOR_0);
    storyRealtime.storyRef(id_1).update({ status: StoryStatus.ERROR });

    const writer_2 = new FirebaseStoryWriter(storyRealtime);
    await writer_2.writeInit(metadata_1_0);
    await writer_2.writeFromGenerator(CLASSIC_LOGIC_0, GENERATOR_0);

    const reader = new FirebaseStoryReader(storyRealtime);
    const stories = await reader.readFormStories("form0");

    expect(new Set(stories)).toEqual(
      new Set([
        {
          id: id_0,
          status: StoryStatus.COMPLETE,
          metadata: metadata_0_0,
        },
        {
          id: id_1,
          status: StoryStatus.ERROR,
          metadata: metadata_0_1,
        },
      ])
    );
  }, 60000);

  test("getImagePrompt after writing story", async () => {
    const writer_0 = new FirebaseStoryWriter(storyRealtime);
    const storyId = await writer_0.writeInit(METADATA_0);
    await writer_0.writeFromGenerator(CLASSIC_LOGIC_0, GENERATOR_0);

    const expected = DUMMY_IMAGE_PROMPT;
    const storyPart = await DUMMY_STORY_PART(expected);
    const partId = await writer_0.writePart(storyPart);
    const imageId = await storyRealtime.getPartImageId(storyId, partId);

    await storyRealtime.expectImagePromptToBe(storyId, imageId, expected);
  });
});
