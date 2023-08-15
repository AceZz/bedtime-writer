import { DocumentReference, getFirestore } from "firebase-admin/firestore";
import { StoryMetadata, StoryStatus } from "../../../src/story";
import { FirestoreStories } from "../../../src/firebase";
import { expect } from "@jest/globals";

/**
 * Helper class to interact with the story questions Firestore collection.
 */
export class FirestoreStoryTestUtils extends FirestoreStories {
  async expectComplete(id: string): Promise<void> {
    const data = await this.getStoryData(id);
    expect(data?.status).toBe(StoryStatus.COMPLETE);
  }

  async expectParts(id: string): Promise<void> {
    const data = await this.getStoryData(id);
    expect(data?.parts.length).toBeGreaterThanOrEqual(1);
  }

  async expectMetadata(id: string, metadata: StoryMetadata): Promise<void> {
    const data = await this.getStoryData(id);
    expect(data?.isFavorite).toBe(metadata.isFavorite);
    expect(data?.title).toBe(metadata.title);
  }

  private async getStoryData(
    id: string
  ): Promise<FirebaseFirestore.DocumentData | undefined> {
    return (await this.storyRef(id).get()).data();
  }

  /**
   * Delete the collection.
   *
   * Firebase must be initialized before calling this function.
   */
  async delete(): Promise<void> {
    const firestore = getFirestore();
    const questions = await firestore.collection(this.collectionPath).get();
    await Promise.all(
      questions.docs.map((story) => this.deleteStory(story.ref))
    );
  }

  private async deleteStory(storyRef: DocumentReference): Promise<void> {
    await storyRef.delete();
  }
}
