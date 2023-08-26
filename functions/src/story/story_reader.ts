import { StoryMetadata } from "./story_metadata";
import { StoryStatus } from "./story_status";

/**
 * Read stories.
 */
export interface StoryReader {
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
}
