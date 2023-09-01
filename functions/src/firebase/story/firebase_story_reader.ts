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

  /**
   * Get the prompt used to generate the image.
   */
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
}
