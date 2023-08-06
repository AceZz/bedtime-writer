import { DocumentReference, getFirestore } from "firebase-admin/firestore";
import {
  ClassicStoryLogic,
  FakeImageApi,
  FakeTextApi,
  FirebaseStoryWriter,
  NPartStoryGenerator,
  StoryGenerator,
  StoryMetadata,
  StoryStatus,
} from "../../../src/story";
import {
  FirestorePaths,
  FirestoreStories,
  FirestoreStoryRealtime,
} from "../../../src/firebase";
import { expect } from "@jest/globals";

/**
 * A dummy story logic.
 */
const duration = 1;
const style = "style1";
const characterName = "characterName1";
const place = "place1";
const characterFlaw = "characterFlaw1";
const characterPower = "characterPower1";
const characterChallenge = "characterChallenge1";
const CLASSIC_LOGIC = new ClassicStoryLogic(
  duration,
  style,
  characterName,
  place,
  characterFlaw,
  characterPower,
  characterChallenge
);

/**
 * A dummy generator.
 */
const TEXT_API = new FakeTextApi();
const IMAGE_API = new FakeImageApi();
const GENERATOR = new NPartStoryGenerator(CLASSIC_LOGIC, TEXT_API, IMAGE_API);

/**
 * A dummy metadata.
 */
const METADATA_1 = new StoryMetadata("author1", "title1");

/**
 * A dummy metadata.
 */
const STORY_ID_1 = "story1";

/**
 * Helper class to interact with the story questions Firestore collection.
 */
export class FirestoreStoryTestUtils {
  constructor(readonly paths: FirestorePaths) {}

  get writer(): FirebaseStoryWriter {
    return new FirebaseStoryWriter(this.stories, METADATA_1, STORY_ID_1);
  }

  get stories(): FirestoreStories {
    return new FirestoreStoryRealtime(this.paths);
  }

  get generator(): StoryGenerator {
    return GENERATOR;
  }

  async createDoc(): Promise<void> {
    this.stories.storyRef(STORY_ID_1).create({});
  }

  async getStoryData(): Promise<FirebaseFirestore.DocumentData | undefined> {
    return (await this.stories.storyRef(STORY_ID_1).get()).data();
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
    expect(data?.isFavorite).toBe(METADATA_1.isFavorite);
    expect(data?.title).toBe(METADATA_1.title);
  }

  /**
   * Delete the collection.
   *
   * Firebase must be initialized before calling this function.
   */
  async deleteCollection(): Promise<void> {
    const firestore = getFirestore();
    const questions = await firestore
      .collection(this.paths.story.realtime)
      .get();
    await Promise.all(
      questions.docs.map((story) => this.deleteStory(story.ref))
    );
  }

  private async deleteStory(storyRef: DocumentReference): Promise<void> {
    await storyRef.delete();
  }
}
