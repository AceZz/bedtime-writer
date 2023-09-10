import { ClassicStoryLogic } from "./logic";
import { StoryMetadata } from "./story_metadata";
import { StoryRegenImageStatus, StoryStatus } from "./story_status";

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
   */
  getImagePrompt(storyId: string, imageId: string): Promise<string>;

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
