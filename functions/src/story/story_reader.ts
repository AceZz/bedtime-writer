import { ClassicStoryLogic } from "./logic";
import { StoryMetadata } from "./story_metadata";
import { StoryRegenImageStatus, StoryStatus } from "./story_status";

export type StoryReaderFilter = {
  request?: { [key: string]: string } | undefined;
};

/**
 * Read stories.
 */
export interface StoryReader {
  /**
   * Return the number of stories.
   */
  countAll(): Promise<number>;

  /**
   * Read the stories which where generated for `formId`.
   *
   * `formId` is matched against the content of `<story>.request.formId`.
   */
  readFormStories(formId: string): Promise<
    {
      id: string;
      status: StoryStatus;
      metadata: StoryMetadata;
    }[]
  >;

  /**
   * Check whether all images for the form's stories are approved.
   */
  checkAllFormImagesApproved(formId: string): Promise<boolean>;

  /**
   * Get the matching story ids based on the filter specified.
   *
   * Stories are returned with a descending order on their
   * createdAt.
   */
  getIds(filter?: StoryReaderFilter): Promise<string[]>;

  /**
   * Get the distinct formIds of the stories in the collection.
   */
  getFormIds(): Promise<string[]>;

  /**
   * Get the ClassicStoryLogic of the story.
   *
   * Throws an error if the logic is not classic.
   */
  getClassicStoryLogic(storyId: string): Promise<ClassicStoryLogic>;

  /**
   * Get the prompt used to generate the image.
   *
   * Returns the corresponding partId too
   */
  getImagePrompt(
    storyId: string,
    imageId: string
  ): Promise<{ imagePrompt: string; partId: string }>;

  /**
   * Get the image ids for the story.
   */
  getImageIds(storyId: string): Promise<string[]>;

  /**
   * Get the image doc.
   */
  getImage(
    storyId: string,
    imageId: string
  ): Promise<{
    imageB64: string;
    regenStatus: StoryRegenImageStatus | undefined;
    isApproved: boolean | undefined;
  }>;
}
