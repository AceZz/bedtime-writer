/**
 * A `StoryLogic` exposes the data needed to create a story, such as the title,
 * prompts, etc. It is also able to validate its underlying data.
 */
export interface StoryLogic {
  isValid(): boolean;

  prompt(): string;

  titlePrompt(): string;

  imagePromptPrompt(): string;

  toJson(): { [key: string]: string | number | undefined };

  toString(): string;
}
