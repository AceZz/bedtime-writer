import { StoryMetadata } from "./story_metadata";
import { StoryStatus } from "./story_status";

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
   * Get the prompt used to generate the image.
   */
  getImagePrompt(storyId: string, imageId: string): Promise<string>;

  /**
   * Get the image ids for the story.
   */
  getImageIds(storyId: string): Promise<string[]>;
}
