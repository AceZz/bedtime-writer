import { StoryPart } from "../story_part";

/**
 * Base interface to generate story parts.
 */
export interface StoryGenerator {
  title(): string;
  nextStoryPart(): Promise<StoryPart>;
}
