import { Timestamp } from "firebase-admin/firestore";

import { FirestoreUserStories } from "../../firebase";
import { UserStoriesManager } from "./user_stories_manager";

/**
 * Update user stories
 */
export class FirebaseUserStoriesManager implements UserStoriesManager {
  constructor(private readonly userStories: FirestoreUserStories) {}

  async addCacheStory(uid: string, storyId: string): Promise<void> {
    // Init the user doc if there are none.
    const hasDoc = await this.hasDoc(uid);
    if (!hasDoc) await this.initDoc(uid);

    const hasCacheStory = await this.hasCacheStory(uid, storyId);
    if (hasCacheStory) {
      await this.userStories
        .userStoryRef(uid, storyId)
        .update({ createdAt: Timestamp.now() });
    } else {
      await this.userStories
        .userStoryRef(uid, storyId)
        .set({ createdAt: Timestamp.now(), isFavorite: false });
    }
  }

  async readCacheStoryIds(uid: string): Promise<string[]> {
    const docs = (await this.userStories.userStoriesRef(uid).select().get())
      .docs;
    return docs.map((doc) => doc.id);
  }

  private async hasCacheStory(uid: string, storyId: string): Promise<boolean> {
    const snapshot = await this.userStories.userStoryRef(uid, storyId).get();
    return snapshot.exists;
  }

  private async hasDoc(uid: string): Promise<boolean> {
    const snapshot = await this.userStories.userRef(uid).get();
    return snapshot.exists;
  }

  private async initDoc(uid: string): Promise<void> {
    await this.userStories.userRef(uid).create({ createdAt: Timestamp.now() });
  }
}
