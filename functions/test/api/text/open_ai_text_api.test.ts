/**
 * These tests are skipped by default because they use the real OpenAI API.
 * When running them, a manual check is advised, hence the `console.log`.
 *
 * Fill the `KEY` variable before launching them.
 */

import { describe, expect, test } from "@jest/globals";

import { getOpenAiApi } from "../../../src/api/open_ai";
import { OpenAiTextApi } from "../../../src/api/text/open_ai_text_api";
import { SystemTextPrompt } from "../../../src/api/text/text_api";

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
    stream.on("data", (token) => {
      tokens.push(token);
    });
    const isComplete = new Promise<void>((resolve) => {
      stream.on("end", () => {
        resolve();
      });
    });
    await isComplete;

    console.log(`OpenAiTextApi.getStream: ${tokens.join("")}`);
  }, 20_000);
});
