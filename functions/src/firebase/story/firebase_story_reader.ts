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
}
