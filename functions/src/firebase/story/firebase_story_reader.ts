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

  async getFormIds(): Promise<string[]> {
    const snapshots = await this.stories.storiesRef().get();

    return snapshots.docs.map((doc) => doc.data().request.formId);
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

  async getImage(storyId: string, imageId: string): Promise<Buffer> {
    const snapshot = await this.stories.imageRef(storyId, imageId).get();
    return snapshot.data()?.data;
  }
}
