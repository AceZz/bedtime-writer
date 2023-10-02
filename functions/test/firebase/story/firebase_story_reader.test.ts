import { beforeAll, beforeEach, describe, expect, test } from "@jest/globals";
import {
  initEnv,
  initFirebase,
  FirebaseStoryWriter,
  FirebaseStoryReader,
} from "../../../src/firebase";
import { FirestoreContextUtils } from "../utils";
import { CLASSIC_LOGIC_0, GENERATOR_0, METADATA_0 } from "../../story/data";
import { StoryMetadata, StoryPart, StoryStatus } from "../../../src/story";
import {
  DUMMY_IMAGE_PROMPT,
  DUMMY_STORY_PART_1,
  DUMMY_STORY_PART_2,
} from "../../story/data/stories";

const storyRealtime = new FirestoreContextUtils("story_reader").storyRealtime;

/**
 * Dummy implementation to access the protected methods of the base class.
 */
class TestFirebaseStoryWriter extends FirebaseStoryWriter {
  // Overrides the parent method to make it public.
  async writePart(part: StoryPart): Promise<string> {
    return await super.writePart(part);
  }
}

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

  test("checkAllFormImagesApproved", async () => {
    const formId = "form0";
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

    const writer_0 = new FirebaseStoryWriter(storyRealtime);
    await writer_0.writeInit(metadata_0_0);
    await writer_0.writeFromGenerator(CLASSIC_LOGIC_0, GENERATOR_0);

    const writer_1 = new FirebaseStoryWriter(storyRealtime);
    await writer_1.writeInit(metadata_0_1);
    await writer_1.writeFromGenerator(CLASSIC_LOGIC_0, GENERATOR_0);

    const reader = new FirebaseStoryReader(storyRealtime);

    const actual_0 = await reader.checkAllFormImagesApproved(formId);
    expect(actual_0).toBe(false);

    const imageIds = await reader.getFormStoryImageIds(formId);
    await writer_0.approveImage(imageIds[0].storyId, imageIds[0].imageId);
    const actual_1 = await reader.checkAllFormImagesApproved(formId);
    expect(actual_1).toBe(false);

    await writer_0.approveImage(imageIds[1].storyId, imageIds[1].imageId);
    const actual_2 = await reader.checkAllFormImagesApproved(formId);
    expect(actual_2).toBe(true);
  }, 60000);

  test("getIds", async () => {
    const metadata_0_0 = new StoryMetadata("author0", {
      formId: "form0",
      characterName: "frosty",
      characterFlaw: "failure",
      characterChallenge: "animal",
    });

    const metadata_0_1 = new StoryMetadata("author1", {
      formId: "form0", // Same form.
      characterName: "frosty",
      characterFlaw: "lazy",
      characterChallenge: "animal",
    });

    const metadata_1_0 = new StoryMetadata("author2", {
      formId: "form1", // Another form.
      characterName: "frosty",
      characterFlaw: "failure",
      characterChallenge: "animal",
    });

    const writer_0 = new FirebaseStoryWriter(storyRealtime);
    const storyId0 = await writer_0.writeInit(metadata_0_0);
    await writer_0.writeFromGenerator(CLASSIC_LOGIC_0, GENERATOR_0);

    const writer_1 = new FirebaseStoryWriter(storyRealtime);
    const storyId1 = await writer_1.writeInit(metadata_0_1);
    await writer_1.writeFromGenerator(CLASSIC_LOGIC_0, GENERATOR_0);

    const writer_2 = new FirebaseStoryWriter(storyRealtime);
    await writer_2.writeInit(metadata_1_0);
    await writer_2.writeFromGenerator(CLASSIC_LOGIC_0, GENERATOR_0);

    const reader = new FirebaseStoryReader(storyRealtime);

    const filter_0 = {
      request: {
        formId: "form0",
        characterName: "frosty",
        characterFlaw: "failure",
        characterChallenge: "animal",
      },
    };
    const actual_1 = await reader.getIds(filter_0);
    expect(actual_1).toEqual([storyId0]);

    const filter_1 = {
      request: {
        formId: "form0",
      },
    };
    const actual_2 = await reader.getIds(filter_1);
    expect(actual_2.sort()).toEqual([storyId1, storyId0].sort());
  }, 60000);

  test("getFormIds", async () => {
    const metadata_0_0 = new StoryMetadata("author0", {
      formId: "form0",
      characterName: "frosty",
      characterFlaw: "failure",
      characterChallenge: "animal",
    });

    const metadata_0_1 = new StoryMetadata("author1", {
      formId: "form0", // Same form.
      characterName: "frosty",
      characterFlaw: "lazy",
      characterChallenge: "animal",
    });

    const metadata_1_0 = new StoryMetadata("author2", {
      formId: "form1", // Another form.
      characterName: "frosty",
      characterFlaw: "failure",
      characterChallenge: "animal",
    });

    const writer_0 = new FirebaseStoryWriter(storyRealtime);
    await writer_0.writeInit(metadata_0_0);
    await writer_0.writeFromGenerator(CLASSIC_LOGIC_0, GENERATOR_0);

    const writer_1 = new FirebaseStoryWriter(storyRealtime);
    await writer_1.writeInit(metadata_0_1);
    await writer_1.writeFromGenerator(CLASSIC_LOGIC_0, GENERATOR_0);

    const writer_2 = new FirebaseStoryWriter(storyRealtime);
    await writer_2.writeInit(metadata_1_0);
    await writer_2.writeFromGenerator(CLASSIC_LOGIC_0, GENERATOR_0);

    const reader = new FirebaseStoryReader(storyRealtime);
    const actual = (await reader.getFormIds()).sort();

    expect(actual.sort()).toEqual(["form0", "form1"]);
  }, 60000);

  test("getClassicStoryLogic", async () => {
    const metadata_0_0 = new StoryMetadata("author0", {
      formId: "form0",
      characterName: "frosty",
      characterFlaw: "failure",
      characterChallenge: "animal",
    });

    const writer_0 = new FirebaseStoryWriter(storyRealtime);
    const storyId = await writer_0.writeInit(metadata_0_0);
    await writer_0.writeFromGenerator(CLASSIC_LOGIC_0, GENERATOR_0);

    const reader = new FirebaseStoryReader(storyRealtime);
    const actual = await reader.getClassicStoryLogic(storyId);

    expect(actual.toString().toLowerCase()).toContain("frosty");
  });

  test("getImagePrompt should get right prompt", async () => {
    const writer = new TestFirebaseStoryWriter(storyRealtime);
    const storyId = await writer.writeInit(METADATA_0);

    const expected = DUMMY_IMAGE_PROMPT;
    const storyPart = await DUMMY_STORY_PART_1(expected);
    const partId = await writer.writePart(storyPart);
    const imageId = await storyRealtime.getPartImageId(storyId, partId);

    const reader = new FirebaseStoryReader(storyRealtime);
    const actual = (await reader.getImagePrompt(storyId, imageId)).imagePrompt;

    expect(actual).toBe(expected);
  });

  test("getImageIds should get all images", async () => {
    const writer = new TestFirebaseStoryWriter(storyRealtime);
    const storyId = await writer.writeInit(METADATA_0);
    const storyPart1 = await DUMMY_STORY_PART_1();
    await writer.writePart(storyPart1);
    const storyPart2 = await DUMMY_STORY_PART_2();
    await writer.writePart(storyPart2);

    const reader = new FirebaseStoryReader(storyRealtime);
    const imageIds = await reader.getImageIds(storyId);
    expect(imageIds.length).toBe(2);
  });

  test("getImage should get an image", async () => {
    const writer = new TestFirebaseStoryWriter(storyRealtime);
    const storyId = await writer.writeInit(METADATA_0);
    const storyPart1 = await DUMMY_STORY_PART_1();
    await writer.writePart(storyPart1);

    const reader = new FirebaseStoryReader(storyRealtime);
    const imageId = (await reader.getImageIds(storyId))[0];
    const image = await reader.getImage(storyId, imageId);

    expect(image.imageB64).not.toBe("");
  });
});
