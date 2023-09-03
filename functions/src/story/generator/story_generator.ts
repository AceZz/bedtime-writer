import { StoryPart } from "../story_part";

/**
 * Base interface to generate story parts.
 */
export interface StoryGenerator {
  /**
   * Generate a title for the story.
   */
  title(): Promise<string>;

  /**
   * Generate the `storyPart`s.
   */
  storyParts(): AsyncGenerator<StoryPart>;
}
