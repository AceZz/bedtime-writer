import { mkdir, writeFile } from "node:fs/promises";

import { beforeAll, describe, expect, test } from "@jest/globals";

import { OnePartStoryGenerator } from "../../../src/story";
import { FULL_CLASSIC_STORY_LOGIC } from "../logic/data";
import {
  OpenAiImageApi,
  OpenAiTextApi,
  getOpenAiApi,
} from "../../../src/open_ai";
import { FAKE_IMAGE_BYTES_0 } from "../../../src/fake";
import { FAKE_IMAGE_API, FAKE_TEXT_API } from "../data";
import { DUMMY_STORY_TEXT } from "./data";

class TestOnePartStoryGenerator extends OnePartStoryGenerator {
  storyText = "";

  setStoryText(text: string) {
    this.storyText = text;
  }
}

describe("with fake APIs", () => {
  function initGenerator() {
    const generator = new TestOnePartStoryGenerator(
      FULL_CLASSIC_STORY_LOGIC,
      FAKE_TEXT_API,
      FAKE_IMAGE_API
    );

    return {
      textApi: FAKE_TEXT_API,
      imageApi: FAKE_IMAGE_API,
      generator,
    };
  }

  test("title", async () => {
    const { generator } = initGenerator();
    generator.setStoryText(DUMMY_STORY_TEXT);

    const actual = await generator.title();

    expect(actual).not.toBe("");
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
    expect(storyPart.image).toBe(FAKE_IMAGE_BYTES_0);
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
