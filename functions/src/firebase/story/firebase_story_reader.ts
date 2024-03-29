import { Query } from "firebase-admin/firestore";
import {
  StoryMetadata,
  StoryReader,
  StoryStatus,
  parseStoryStatus,
  StoryRegenImageStatus,
  ClassicStoryLogic,
  StoryPart,
} from "../../story";
import { StoryReaderFilter } from "../../story/story_reader";
import { FirestoreStories } from "./firestore_stories";

export class FirebaseStoryReader implements StoryReader {
  constructor(private readonly stories: FirestoreStories) {}

  async countAll(): Promise<number> {
    return (await this.stories.storiesRef().count().get()).data()?.count;
  }

  async readFormStories(
    formId: string
  ): Promise<{ id: string; status: StoryStatus; metadata: StoryMetadata }[]> {
    const snapshots = await this.stories
      .storiesRef()
      .where("request.formId", "==", formId)
      .get();

    return snapshots.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        status: parseStoryStatus(data?.status),
        metadata: new StoryMetadata(data?.user, data?.request),
      };
    });
  }

  async checkAllFormImagesApproved(formId: string): Promise<boolean> {
    const storyIds = (await this.readFormStories(formId)).map((doc) => doc.id);
    const approvals = await Promise.all(
      storyIds.map(async (storyId) => {
        return await this.checkStoryImagesApproved(storyId);
      })
    );
    return approvals.every((approval) => approval);
  }

  private async checkStoryImagesApproved(storyId: string): Promise<boolean> {
    const count = await this.stories
      .imagesRef(storyId)
      .where("isApproved", "==", false)
      .count()
      .get();
    return count.data().count === 0;
  }

  async getFormStoryImageIds(
    formId: string
  ): Promise<{ storyId: string; imageId: string }[]> {
    const storyIds = await (
      await this.readFormStories(formId)
    ).map((story) => story.id);
    const imageIds = await Promise.all(
      storyIds.flatMap(async (storyId) => {
        const storyImageIds = await this.getImageIds(storyId);
        return storyImageIds.map((imageId) => ({ storyId, imageId }));
      })
    );

    return imageIds.flat().sort();
  }

  async getClassicStoryLogic(storyId: string): Promise<ClassicStoryLogic> {
    const data = (await this.stories.storyRef(storyId).get()).data();
    if (data === undefined || data === null) {
      throw new Error(
        `getStoryLogic: no logic found in doc of story ${storyId}`
      );
    }
    if (data.logic.logicType !== "classic") {
      throw new Error(
        `getStoryLogic: logic found is not classic logic for ${storyId}`
      );
    }
    return new ClassicStoryLogic(
      data.logic.duration,
      data.logic.style,
      data.logic.characterName,
      data.logic.place,
      data.logic.object,
      data.logic.characterFlaw,
      data.logic.characterPower,
      data.logic.characterChallenge
    );
  }

  async getIds(filter?: StoryReaderFilter): Promise<string[]> {
    const query = this.buildQuery(filter);
    // Do an empty projection as only doc ids matter.
    const snapshots = await query.select().get();
    return snapshots.docs.map((doc) => doc.id);
  }

  private buildQuery(filter?: StoryReaderFilter): Query {
    let query: Query = this.stories.storiesRef();

    if (filter?.request) {
      for (const [key, value] of Object.entries(filter.request)) {
        query = query.where(`request.${key}`, "==", value);
      }
    }

    return query;
  }

  async getFormIds(): Promise<string[]> {
    const snapshots = await this.stories.storiesRef().get();
    const formIdsSet = new Set<string>();

    snapshots.docs.forEach((doc) => {
      formIdsSet.add(doc.data().request.formId);
    });

    return Array.from(formIdsSet);
  }

  async getStoryParts(storyId: string): Promise<Map<string, StoryPart>> {
    const parts = new Map();

    const snapshot = await this.stories.storyRef(storyId).get();
    const partIds = snapshot.data()?.partIds;

    for (const partId of partIds) {
      const partSnapshot = await this.stories.partRef(storyId, partId).get();
      const promptSnapshot = await this.stories
        .promptsDocRef(storyId, partId)
        .get();

      const imageId = partSnapshot.data()?.image ?? undefined;
      const imageSnapshot =
        imageId === undefined
          ? undefined
          : await this.stories.imageRef(storyId, imageId).get();

      parts.set(
        partId,
        new StoryPart(
          partSnapshot.data()?.text,
          promptSnapshot.data()?.textPrompt,
          imageSnapshot?.data()?.data,
          promptSnapshot.data()?.imagePrompt,
          promptSnapshot.data()?.imagePromptPrompt
        )
      );
    }

    return parts;
  }

  async getImagePrompts(
    storyId: string,
    imageId: string
  ): Promise<{
    imagePromptPrompt: string;
    imagePrompt: string;
    partId: string;
  }> {
    const partsRef = this.stories.partsRef(storyId);
    const partId = (await partsRef.where("image", "==", imageId).get()).docs[0]
      .id;
    const snapshot = await this.stories.promptsDocRef(storyId, partId).get();
    const prompts = snapshot.data();
    const imagePromptPrompt = prompts?.imagePromptPrompt;
    const imagePrompt = prompts?.imagePrompt;

    if (imagePromptPrompt === undefined) {
      throw new Error("getImagePrompts: imagePromptPrompt is undefined");
    }
    if (imagePrompt === undefined) {
      throw new Error("getImagePrompts: imagePrompt is undefined");
    }

    return { imagePromptPrompt, imagePrompt, partId };
  }

  async getImageIds(storyId: string): Promise<string[]> {
    const snapshot = await this.stories.imagesRef(storyId).select("id").get();
    return snapshot.docs.map((doc) => doc.id);
  }

  async getImage(
    storyId: string,
    imageId: string
  ): Promise<{
    imageB64: string;
    regenStatus: StoryRegenImageStatus | undefined;
    isApproved: boolean | undefined;
  }> {
    const docData = (
      await this.stories.imageRef(storyId, imageId).get()
    ).data();
    const imageB64 = (docData?.data as Buffer).toString("base64");
    const regenStatus = docData?.regenStatus as
      | StoryRegenImageStatus
      | undefined;
    const isApproved = docData?.isApproved as boolean | undefined;

    return { imageB64, regenStatus, isApproved };
  }
}
