import { beforeAll, describe, expect, test } from "@jest/globals";
import { mkdir, writeFile } from "node:fs/promises";

import { OpenAiImageApi, getOpenAiApi } from "../../../src/open_ai";
import {
  NPartStoryGenerator,
  FakeTextApi,
  OpenAiTextApi,
} from "../../../src/story";
import { FULL_CLASSIC_STORY_LOGIC } from "../logic/data";
import { FAKE_IMAGE_BYTES, FakeImageApi } from "../../../src/fake";

describe("with fake APIs", () => {
  function initGenerator() {
    const textApi = new FakeTextApi(5, 100, 500, 100);
    const imageApi = new FakeImageApi();
    const generator = new NPartStoryGenerator(
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

    const expectedParts = Array.from(textApi.getParts());
    let i = 0;

    const parts = [];
    for await (const part of generator.storyParts()) {
      parts.push(part);
    }

    expect(parts.length).toBe(expectedParts.length);

    for (const [index, part] of parts.entries()) {
      expect(part.text.trim()).toBe(expectedParts[i++].join("").trim());
      expect(
        part.textPrompt.startsWith(
          "Write a fairy tale in the style of some style."
        )
      );

      if (index === 0) {
        expect(part.image).toBe(FAKE_IMAGE_BYTES);
        expect(part.imagePrompt?.trim()).toBe(
          Array.from(textApi.getTokens()).join("").trim()
        );
        expect(
          part.imagePromptPrompt?.startsWith(
            "Generate now a very simple and concise prompt for dalle"
          )
        );
      } else {
        expect(part.image).toBeUndefined();
        expect(part.imagePrompt).toBeUndefined();
        expect(part.imagePromptPrompt).toBeUndefined();
      }
    }
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
    return new NPartStoryGenerator(
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
    const PATH = (i: number) =>
      `${OUTPUT_FOLDER}/NPartStoryGenerator_storyPart_${i}.png`;
    const generator = initGenerator();

    let i = 0;
    for await (const storyPart of generator.storyParts()) {
      console.log(`StoryPart ${i}: ${storyPart.text}`);

      expect(storyPart.image).not.toBeUndefined();
      await writeFile(PATH(i), storyPart.image!);
      console.log(`image ${i} saved at ${PATH(i)}`);

      i++;
    }

    expect(i).toBeGreaterThan(3);
  }, 60_000);
});
