import { readFile } from "fs/promises";

import { StoryPart } from "../../../src/story";

/**
 * A dummy image prompt.
 */
export const DUMMY_IMAGE_PROMPT = "dummy image prompt";

/**
 * A dummy StoryPart.
 */
export async function DUMMY_STORY_PART(imagePrompt: string) {
  const image = await readFile("test/story/data/story_image.jpg");
  return new StoryPart(
    "dummy text",
    "dummy text prompt",
    image,
    imagePrompt,
    "dummy image prompt prompt"
  );
}
