import { StoryGenerator } from "./generator";
import { StoryPart } from "./story_part";

/**
 * Interface to write stories to some output.
 */
export interface StoryWriter {
  /**
   * Write end-to-end a story from a generator and return its id.
   */
  writeFromGenerator(generator: StoryGenerator): Promise<string>;

  /**
   * Write the metadata of a new story and return its id.
   */
  writeMetadata(): Promise<string>;

  /**
   * Write a part of the story and return its id.
   */
  writePart(part: StoryPart): Promise<string>;

  /**
   * Mark the story as complete.
   *
   * Note: calling `writePart` after `writeComplete` is undefined behaviour
   * and should be avoided.
   */
  writeComplete(): Promise<void>;

  /**
   * Mark the story as having encountered an error.
   */
  writeError(): Promise<void>;
}
