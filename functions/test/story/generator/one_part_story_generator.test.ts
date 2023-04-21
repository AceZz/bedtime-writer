import { mkdir, writeFile } from "node:fs/promises";

import { beforeAll, describe, expect, test } from "@jest/globals";

import { OnePartStoryGenerator } from "../../../src/story/generator/one_part_story_generator";
import { FULL_CLASSIC_STORY_LOGIC } from "../logic/data";
import {
  OpenAiTextApi,
  FakeTextApi,
} from "../../../src/story/generator/text_api";
import {
  FAKE_IMAGE_BYTES,
  FakeImageApi,
  OpenAiImageApi,
} from "../../../src/story/generator/image_api";
import { getOpenAiApi } from "../../../src/open_ai";

describe("with fake APIs", () => {
  function initGenerator() {
    const textApi = new FakeTextApi();
    const imageApi = new FakeImageApi();
    const generator = new OnePartStoryGenerator(
      FULL_CLASSIC_STORY_LOGIC,
      textApi,
      imageApi
    );

    return {
      textApi,
      imageApi,
      generator,
    };
  }

  test("title", () => {
    const { generator } = initGenerator();
    expect(generator.title()).toBe("The story of Someone");
  });

  test("nextStoryPart", async () => {
    const { textApi, generator } = initGenerator();
    const expectedTokens = Array.from(textApi.getTokens()).join("");

    const parts = [];
    for await (const part of generator.storyParts()) {
      parts.push(part);
    }

    expect(parts.length).toBe(1);
    const storyPart = parts[0];

    expect(storyPart.text).toBe(expectedTokens);
    expect(
      storyPart.textPrompt.startsWith(
        "Write a fairy tale in the style of some style."
      )
    );
    expect(storyPart.image).toBe(FAKE_IMAGE_BYTES);
    expect(storyPart.imagePrompt).toBe(expectedTokens);
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

    const parts = [];
    for await (const part of generator.storyParts()) {
      parts.push(part);
    }

    expect(parts.length).toBe(1);
    const storyPart = parts[0];

    console.log(`OnePartStoryGenerator.nextStoryPart: ${storyPart.text}`);

    expect(storyPart.image).not.toBeUndefined();
    await writeFile(PATH, storyPart.image!);
    console.log(`OnePartStoryGenerator.nextStoryPart: image saved at ${PATH}`);
  }, 60_000);
});
