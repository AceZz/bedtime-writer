import { StoryReviewer } from ".";
import { FirestoreStories } from "../../firebase";
import { ImageApi, IMAGE_SIZE_DEFAULT } from "../generator";
import {
  REGEN_STATUS_COMPLETE,
  REGEN_STATUS_ERROR,
  REGEN_STATUS_PENDING,
} from "./story_reviewer";

/**
 * The Firestore document has the following schema:
 *
 * <story_collection>/
 *   <story_id>
 *     author (already set)
 *     isFavorite
 *     status
 *     timestamp (already set)
 *     title
 *     request {}
 *     parts = [part1_id, part2_id]
 *     images/
 *       <image_id>
 *         data
 *     parts/
 *       <part_id>
 *         text
 *         image = image_id
 *     prompts
 *       <part_id>
 *         textPrompt
 *         imagePrompt
 *         imagePromptPrompt
 */
export class FirebaseStoryReviewer implements StoryReviewer {
  constructor(private readonly stories: FirestoreStories) {}

  async regenImage(
    storyId: string,
    imageId: string,
    imageApi: ImageApi
  ): Promise<void> {
    try {
      await this.setRegenImageStatus(storyId, imageId, REGEN_STATUS_PENDING);
      const prompt = await this.stories.getImagePrompt(storyId, imageId);

      const newImage = await imageApi.getImage(prompt, {
        n: 1,
        size: IMAGE_SIZE_DEFAULT,
      });

      await this.replaceImage(storyId, imageId, newImage);
      await this.setRegenImageStatus(storyId, imageId, REGEN_STATUS_COMPLETE);
    } catch (error) {
      await this.setRegenImageStatus(storyId, imageId, REGEN_STATUS_ERROR);
      throw error;
    }
  }

  async approveImage(storyId: string, imageId: string): Promise<void> {
    const imageRef = this.stories.imageRef(storyId, imageId);

    const imageData = (await imageRef.get()).data()?.data;

    if (imageData == undefined) {
      throw new Error("approveImage: no image found");
    }

    const payload = {
      approved: "true",
    };
    await imageRef.update(payload);
  }

  private async replaceImage(storyId: string, imageId: string, image: Buffer) {
    const imageRef = this.stories.imageRef(storyId, imageId);

    const imageData = (await imageRef.get()).data()?.data;

    if (imageData == undefined) {
      throw new Error("replaceImage: no current image data found");
    }

    const payload = {
      data: image,
    };
    await imageRef.set(payload);
  }

  private async setRegenImageStatus(
    storyId: string,
    imageId: string,
    status: string
  ): Promise<void> {
    const imageRef = this.stories.imageRef(storyId, imageId);
    const payload = {
      regenStatus: status,
    };
    await imageRef.update(payload);
  }
}
