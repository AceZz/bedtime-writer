import assert from "node:assert";
import test from "node:test";

import {
  generateImage,
  generateOpenAiStory,
  generateStory,
  generateSummary,
} from "../../story/open_ai.js";
import {
  fakeOpenAi,
  FAKE_IMAGE_BYTES,
  FAKE_TOKENS,
} from "../../story/fake_open_ai.js";

test("generateOpenAiStory", async () => {
  const expectedStory = FAKE_TOKENS.join("");
  const expectedImagePrompt = FAKE_TOKENS.join("");
  const expectedImageBytes = FAKE_IMAGE_BYTES;

  const { story, imagePrompt, imageBytes } = await generateOpenAiStory(
    fakeOpenAi,
    "prompt",
    "imagePromptPrompt"
  );

  assert.equal(story, expectedStory);
  assert.equal(imagePrompt, expectedImagePrompt);
  assert(expectedImageBytes.equals(imageBytes));
});

test("generateImage", async () => {
  const response = await fakeOpenAi.createChatCompletion(
    {},
    { responseType: "stream" }
  );
  const expectedImagePrompt = FAKE_TOKENS.join("");
  const expectedImageBytes = FAKE_IMAGE_BYTES;

  const { imagePrompt, imageBytes } = await generateImage(
    fakeOpenAi,
    "prompt",
    response.data,
    "imagePromptPrompt"
  );

  assert.equal(imagePrompt, expectedImagePrompt);
  assert(expectedImageBytes.equals(imageBytes));
});

test("generateSummary", async () => {
  const response = await fakeOpenAi.createChatCompletion(
    {},
    { responseType: "stream" }
  );
  const expected = FAKE_TOKENS.slice(0, 100).join("");

  const summary = await generateSummary(response.data);
  assert.equal(summary, expected);
});

test("generateStory", async () => {
  const response = await fakeOpenAi.createChatCompletion(
    {},
    { responseType: "stream" }
  );
  const expected = FAKE_TOKENS.join("");

  const story = await generateStory(response.data);
  assert.equal(story, expected);
});
