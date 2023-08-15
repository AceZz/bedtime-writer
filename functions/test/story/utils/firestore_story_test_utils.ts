import { DocumentReference, getFirestore } from "firebase-admin/firestore";
import {
  FirebaseStoryWriter,
  StoryGenerator,
  StoryStatus,
} from "../../../src/story";
import { FirestoreStories } from "../../../src/firebase";
import { expect } from "@jest/globals";
import { GENERATOR_0, METADATA_0, STORY_ID_0 } from "../data/";

/**
 * Helper class to interact with the story questions Firestore collection.
 */
export class FirestoreStoryTestUtils {
  constructor(private readonly stories: FirestoreStories) {}

  get writer(): FirebaseStoryWriter {
    return new FirebaseStoryWriter(this.stories, METADATA_0, STORY_ID_0);
  }

  get generator(): StoryGenerator {
    return GENERATOR_0;
  }

  async createDoc(): Promise<void> {
    this.stories.storyRef(STORY_ID_0).create({});
  }

  async getStoryData(): Promise<FirebaseFirestore.DocumentData | undefined> {
    return (await this.stories.storyRef(STORY_ID_0).get()).data();
  }

  async expectComplete(): Promise<void> {
    const data = await this.getStoryData();
    expect(data?.status).toBe(StoryStatus.COMPLETE);
  }

  async expectParts(): Promise<void> {
    const data = await this.getStoryData();
    expect(data?.parts.length).toBeGreaterThanOrEqual(1);
  }

  async expectMetadata(): Promise<void> {
    const data = await this.getStoryData();
    expect(data?.isFavorite).toBe(METADATA_0.isFavorite);
    expect(data?.title).toBe(METADATA_0.title);
  }

  /**
   * Delete the collection.
   *
   * Firebase must be initialized before calling this function.
   */
  async deleteCollection(): Promise<void> {
    const firestore = getFirestore();
    const questions = await firestore
      .collection(this.stories.collectionPath)
      .get();
    await Promise.all(
      questions.docs.map((story) => this.deleteStory(story.ref))
    );
  }

  private async deleteStory(storyRef: DocumentReference): Promise<void> {
    await storyRef.delete();
  }
}
