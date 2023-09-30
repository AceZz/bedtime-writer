import { readFile } from "fs/promises";

import { StoryPart } from "../../../src/story";

/**
 * A dummy image prompt.
 */
export const DUMMY_IMAGE_PROMPT = "dummy image prompt";

/**
 * A dummy StoryPart.
 */
export async function DUMMY_STORY_PART_1(imagePrompt?: string) {
  const image = await readFile("test/story/data/story_image_1.jpg");
  return new StoryPart(
    "dummy text",
    "dummy text prompt",
    image,
    imagePrompt ?? "dummy image prompt",
    "dummy image prompt prompt"
  );
}

/**
 * Another dummy StoryPart.
 */
export async function DUMMY_STORY_PART_2(imagePrompt?: string) {
  const image = await readFile("test/story/data/story_image_2.jpg");
  return new StoryPart(
    "dummy text",
    "dummy text prompt",
    image,
    imagePrompt ?? "dummy image prompt",
    "dummy image prompt prompt"
  );
}
