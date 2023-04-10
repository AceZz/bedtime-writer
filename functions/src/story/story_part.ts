/**
 * A part of a story, with text and an optional image.
 */
export class StoryPart {
  text: string;
  textPrompt: string;
  image?: Buffer;
  imagePrompt?: string;
  imagePromptPrompt?: string;

  constructor(
    text: string,
    textPrompt: string,
    image?: Buffer,
    imagePrompt?: string,
    imagePromptPrompt?: string
  ) {
    this.text = text;
    this.textPrompt = textPrompt;
    this.image = image;
    this.imagePrompt = imagePrompt;
    this.imagePromptPrompt = imagePromptPrompt;
  }
}
