import { DocumentReference } from "firebase-admin/firestore";
import { StoryLogic, StoryMetadata, StoryStatus } from "../../../src/story";
import { FirestoreStories } from "../../../src/firebase";
import { expect } from "@jest/globals";
import { valueOrNull } from "../../../src/utils";

/**
 * Helper class to interact with the story questions Firestore collection.
 */
export class FirestoreStoriesUtils extends FirestoreStories {
  async expectInitMetadata(id: string, metadata: StoryMetadata): Promise<void> {
    const data = await this.getStoryData(id);

    expect(data?.parts).toStrictEqual([]);
    expect(data?.request).toStrictEqual(metadata.request);
    expect(data?.status).toBe(StoryStatus.PENDING);
    expect(data?.user).toBe(metadata.user);
  }

  async expectLogic(id: string, logic: StoryLogic): Promise<void> {
    const data = await this.getStoryData(id);

    const logicJson = logic.toJson();
    const logicJsonWithNull: { [key: string]: string | number | null } = {};
    for (const key in logicJson) {
      logicJsonWithNull[key] = valueOrNull(logicJson[key]);
    }

    expect(data?.logic).toStrictEqual(logicJsonWithNull);
  }

  async expectParts(
    id: string,
    numParts: number,
    numImages: number
  ): Promise<void> {
    expect(await this.getNumPartsList(id)).toBe(numParts);
    expect(await this.getNumParts(id)).toBe(numParts);
    expect(await this.getNumPrompts(id)).toBe(numParts);
    expect(await this.getNumImages(id)).toBe(numImages);
  }

  async getNumPartsList(id: string): Promise<number> {
    const data = await this.getStoryData(id);
    return data?.parts.length;
  }

  async getNumParts(id: string): Promise<number> {
    const data = (await this.partsRef(id).count().get()).data();
    return data?.count;
  }

  async getNumPrompts(id: string): Promise<number> {
    const data = (await this.promptsRef(id).count().get()).data();
    return data?.count;
  }

  async getNumImages(id: string): Promise<number> {
    const data = (await this.imagesRef(id).count().get()).data();
    return data?.count;
  }

  async expectComplete(id: string): Promise<void> {
    const data = await this.getStoryData(id);
    expect(data?.status).toBe(StoryStatus.COMPLETE);
  }

  async getPartImageId(storyId: string, partId: string): Promise<string> {
    const data = (await this.partRef(storyId, partId).get()).data();
    return data?.image;
  }

  async expectImagePromptToBe(
    storyId: string,
    imageId: string,
    expected: string
  ) {
    const partsRef = this.partsRef(storyId);
    const partId = (await partsRef.where("image", "==", imageId).get()).docs[0]
      .id;
    const prompts = (await this.promptsDocRef(storyId, partId).get()).data();
    const actual = prompts?.imagePrompt;

    expect(actual).toBe(expected);
  }

  /**
   * Compares the image in the database with the one provided
   *
   * Firebase must be initialized before calling this function.
   */
  async expectImageToBe(
    storyId: string,
    imageId: string,
    expected: Buffer
  ): Promise<void> {
    const actual: Buffer = (await this.imageRef(storyId, imageId).get()).data()
      ?.data;
    // This is how Buffer should be compared.
    expect(actual.equals(expected)).toBe(true);
  }

  /**
   * Checks wether the image is approved
   */
  async expectImageToBeApproved(
    storyId: string,
    imageId: string
  ): Promise<void> {
    const actual = (await this.imageRef(storyId, imageId).get()).data()
      ?.approved;
    expect(actual).toBe(true);
  }

  /**
   * Checks wether the image is not approved
   */
  async expectImageToNotBeApproved(
    storyId: string,
    imageId: string
  ): Promise<void> {
    const actual = (await this.imageRef(storyId, imageId).get()).data()
      ?.approved;
    expect(actual).not.toBe(true);
  }

  /**
   * Checks image regen status
   */
  async expectImageRegenStatusToBe(
    storyId: string,
    imageId: string,
    expected: string
  ): Promise<void> {
    const actual = (await this.imageRef(storyId, imageId).get()).data()
      ?.regenStatus;
    expect(actual).toBe(expected);
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
    const questions = await this.storiesRef().get();
    await Promise.all(
      questions.docs.map((story) => this.deleteStory(story.ref))
    );
  }

  private async deleteStory(storyRef: DocumentReference): Promise<void> {
    await storyRef.delete();
  }
}
