import { StoryGenerator } from "./generator";
import { StoryLogic } from "./logic";
import { StoryMetadata } from "./story_metadata";
import { StoryPart } from "./story_part";

/**
 * Write stories to some output.
 *
 * The id of the location can either be provided through the constructor or
 * chosen with a call to `writeInit()`.
 */
export abstract class StoryWriter {
  constructor(protected id: string | undefined) {}

  /**
   * Write metadata to a new location and return its id.
   *
   * Throw if `this.id` is already defined.
   */
  async writeInit(metadata: StoryMetadata): Promise<string> {
    if (this.id !== undefined)
      throw new Error("StoryWriter: this writer is already initialized.");

    this.id = await this.writeInitMetadata(metadata);
    return this.id;
  }

  /**
   * Write a part of the story and return its id.
   */
  abstract writePart(part: StoryPart): Promise<string>;

  /**
   * Write metadata to a new location and return its id.
   */
  protected abstract writeInitMetadata(
    metadata: StoryMetadata
  ): Promise<string>;

  /**
   * Write a full story from a generator.
   *
   * Note: any existing part will be deleted first.
   */
  async writeFromGenerator(
    logic: StoryLogic,
    generator: StoryGenerator
  ): Promise<void> {
    if (this.id === undefined)
      throw new Error(
        "StoryWriter: this writer is not initialized, please call " +
          "`this.writeInit` or provide an id to the constructor."
      );

    try {
      await this.writeTitle(generator.title());
      await this.writeLogic(logic);

      await this.deleteParts();

      for await (const part of generator.storyParts()) {
        await this.writePart(part);
      }
      await this.writeStatusComplete();
    } catch (error) {
      await this.writeStatusError(error);
    }
  }

  /**
   * Write the title of the story.
   */
  protected abstract writeTitle(title: string): Promise<void>;

  /**
   * Write the logic of the story.
   */
  protected abstract writeLogic(logic: StoryLogic): Promise<void>;

  /**
   * Delete any existing parts / prompts / images.
   */
  protected abstract deleteParts(): Promise<void>;

  /**
   * Mark the story as complete.
   *
   * Note: calling `writePart` after `writeStatusComplete` is undefined
   * behaviour.
   */
  protected abstract writeStatusComplete(): Promise<void>;

  /**
   * Mark the story as having encountered an error.
   *
   * Note: calling `writePart` after `writeStatusError` is undefined behaviour.
   */
  protected abstract writeStatusError(error: unknown): Promise<void>;
}
