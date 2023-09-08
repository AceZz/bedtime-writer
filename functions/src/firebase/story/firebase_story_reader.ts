import {
  StoryMetadata,
  StoryReader,
  StoryStatus,
  parseStoryStatus,
  StoryRegenImageStatus,
  ClassicStoryLogic,
} from "../../story";
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
    const storyImageIds = await this.getFormStoryImageIds(formId);

    const approvals = await Promise.all(
      storyImageIds.map(async (image) => {
        return await this.checkImageApproved(image.storyId, image.imageId);
      })
    );

    const isAllApproved = !new Set(approvals).has(false);
    return isAllApproved;
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

  async getFormIds(): Promise<string[]> {
    const snapshots = await this.stories.storiesRef().get();
    const formIdsSet = new Set<string>();

    snapshots.docs.forEach((doc) => {
      formIdsSet.add(doc.data().request.formId);
    });

    return Array.from(formIdsSet);
  }

  async getImagePrompt(storyId: string, imageId: string): Promise<string> {
    const partsRef = this.stories.partsRef(storyId);
    const partId = (await partsRef.where("image", "==", imageId).get()).docs[0]
      .id;
    const prompts = (
      await this.stories.promptsDocRef(storyId, partId).get()
    ).data();
    const imagePrompt = prompts?.imagePrompt;

    if (imagePrompt === undefined) {
      throw new Error("getImagePrompt: image prompt is undefined");
    }

    return imagePrompt;
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

  private async checkImageApproved(
    storyId: string,
    imageId: string
  ): Promise<boolean> {
    const image = await this.getImage(storyId, imageId);
    return image.isApproved ? true : false;
  }
}
