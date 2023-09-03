import {
  StoryMetadata,
  StoryReader,
  StoryStatus,
  parseStoryStatus,
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

  async readFormStoryImagesAsMap(
    formId: string
  ): Promise<
    Map<string, { storyId: string; status: string; b64Image: string }>
  > {
    const storyIds = (await this.getFormStoryIds(formId)).sort(); // Sorts story ids.

    const imageIdToImageData = new Map();

    for (const storyId of storyIds) {
      const imageIds = (await this.getImageIds(storyId)).sort(); // Sorts image ids within story.
      for (const imageId of imageIds) {
        const { data, status, isApproved } = await this.getImage(
          storyId,
          imageId
        );
        imageIdToImageData.set(imageId, {
          storyId: storyId,
          status: status,
          isApproved: isApproved,
          imageB64: data.toString("base64"),
        });
      }
    }

    return imageIdToImageData;
  }

  async getFormIds(): Promise<string[]> {
    const snapshots = await this.stories.storiesRef().get();
    const formIdsSet = new Set<string>();

    snapshots.docs.forEach((doc) => {
      formIdsSet.add(doc.data().request.formId);
    });

    return Array.from(formIdsSet);
  }

  async getFormStoryIds(formId: string): Promise<string[]> {
    const snapshots = await this.stories
      .storiesRef()
      .where("request.formId", "==", formId)
      .get();

    return snapshots.docs.map((doc) => doc.id);
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
    const snapshot = await this.stories.imagesRef(storyId).get();
    return snapshot.docs.map((doc) => doc.id);
  }

  async getImage(
    storyId: string,
    imageId: string
  ): Promise<{
    data: Buffer;
    status: string | undefined;
    isApproved: boolean | undefined;
  }> {
    const docData = (
      await this.stories.imageRef(storyId, imageId).get()
    ).data();
    const data = docData?.data as Buffer;
    const status = docData?.status as string | undefined;
    const isApproved = docData?.isApproved as boolean | undefined;

    return { data, status, isApproved };
  }
}
