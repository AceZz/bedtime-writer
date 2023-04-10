import { StoryPart } from "../story_part";

export interface StorySaver {
  /**
   * Create a story metadata and return its id.
   */
  createStory(): Promise<string>;

  /**
   * Save a part of the story and return its id.
   */
  savePart(part: StoryPart): Promise<string>;
}
