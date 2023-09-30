/**
 * These tests are skipped by default because they use the real OpenAI API.
 * When running them, a manual check is advised, hence the `console.log`.
 *
 * Fill the `KEY` variable before launching them.
 */

import { describe, expect, test } from "@jest/globals";
import { OpenAiTextApi, getOpenAiApi } from "../../../../src/open_ai";
import { SystemTextPrompt } from "../../../../src/story";

describe.skip("OpenAiTextApi", () => {
  const KEY = "...";
  const API = new OpenAiTextApi(getOpenAiApi(KEY), "gpt-3.5-turbo");

  test("getText", async () => {
    const text = await API.getText([new SystemTextPrompt("Say hello.")], {});
    expect(text.toLowerCase().includes("hello"));

    console.log(`OpenAiTextApi.getText: ${text}`);
  }, 20_000);

  test("getStream", async () => {
    const stream = await API.getStream(
      [new SystemTextPrompt("Tell a joke.")],
      {}
    );

    const tokens: string[] = [];
    for await (const token of stream) {
      tokens.push(token);
    }

    console.log(`OpenAiTextApi.getStream: ${tokens.join("")}`);
  }, 20_000);
});
