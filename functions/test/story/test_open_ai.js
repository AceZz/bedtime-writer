import assert from "node:assert";
import test from "node:test";

import {
  callOpenAiCompletions,
  callOpenAiImagesGeneration,
} from "../../story/open_ai.js";

test("callOpenAiCompletions", { skip: true }, async () => {
  const text = await callOpenAiCompletions("say hello");
  assert(text.toLowerCase().trim().includes("hello"));
});

test("callOpenAiImagesGeneration", { skip: true }, async () => {
  const url = await callOpenAiImagesGeneration("something", 256);
  assert(url.startsWith("https"));
});
