import { mkdir, writeFile } from "node:fs/promises";

import { beforeAll, describe, expect, test } from "@jest/globals";

import { OnePartStoryGenerator } from "../../../src/story/generator/one_part_story_generator";
import { FULL_CLASSIC_STORY_LOGIC } from "../logic/data";
import {
  getOpenAiApi,
  OpenAiTextApi,
  OpenAiImageApi,
  FakeTextApi,
  FakeImageApi,
  FAKE_TOKENS,
  FAKE_IMAGE_BYTES,
} from "../../../src/api";

describe("with fake APIs", () => {
  function initGenerator() {
    return new OnePartStoryGenerator(
      FULL_CLASSIC_STORY_LOGIC,
      new FakeTextApi(),
      new FakeImageApi()
    );
  }

  test("title", () => {
    const generator = initGenerator();
    expect(generator.title()).toBe("The story of Someone");
  });

  test("nextStoryPart", async () => {
    const generator = initGenerator();
    const storyPart = await generator.nextStoryPart();

    expect(storyPart.text).toBe(FAKE_TOKENS.join(""));
    expect(
      storyPart.textPrompt.startsWith(
        "Write a fairy tale in the style of some style."
      )
    );
    expect(storyPart.image).toBe(FAKE_IMAGE_BYTES);
    expect(storyPart.imagePrompt).toBe(FAKE_TOKENS.join(""));
    expect(
      storyPart.imagePromptPrompt?.startsWith(
        "Generate now a very simple and concise prompt for dalle"
      )
    );
  });
});

describe.skip("with OpenAI APIs", () => {
  const OUTPUT_FOLDER = "test/output";
  const KEY = "...";
  const API = getOpenAiApi(KEY);

  beforeAll(async () => {
    await mkdir(OUTPUT_FOLDER, { recursive: true });
  });

  function initGenerator() {
    return new OnePartStoryGenerator(
      FULL_CLASSIC_STORY_LOGIC,
      new OpenAiTextApi(API, "gpt-3.5-turbo"),
      new OpenAiImageApi(API)
    );
  }

  test("title", () => {
    const generator = initGenerator();
    expect(generator.title()).toBe("The story of Someone");
  });

  test("nextStoryPart", async () => {
    const PATH = `${OUTPUT_FOLDER}/OnePartStoryGenerator_nextStoryPart.png`;
    const generator = initGenerator();
    const storyPart = await generator.nextStoryPart();

    console.log(`OnePartStoryGenerator.nextStoryPart: ${storyPart.text}`);

    expect(storyPart.image).not.toBeUndefined();
    await writeFile(PATH, storyPart.image!);
    console.log(`OnePartStoryGenerator.nextStoryPart: image saved at ${PATH}`);
  }, 60_000);
});
