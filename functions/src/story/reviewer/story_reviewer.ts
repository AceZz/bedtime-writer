import { ImageApi } from "../generator";

export const REGEN_STATUS_PENDING = "pending";

export const REGEN_STATUS_COMPLETE = "complete";

export const REGEN_STATUS_ERROR = "error";

/**
 * Interface to review stories and make modifications.
 */
export interface StoryReviewer {
  /**
   * Regenerate an image of a story.
   */
  regenImage(
    storyId: string,
    imageId: string,
    imageApi: ImageApi
  ): Promise<void>;

  /**
   * Approve an image to be served.
   *
   * This writes a new field `approved: true` in the
   * image document.
   */
  approveImage(storyId: string, imageId: string): Promise<void>;
}
