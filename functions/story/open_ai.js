import { Buffer } from "node:buffer";
import { logger } from "firebase-functions";

import * as dotenv from "dotenv";
dotenv.config();

const NUM_TOKENS_SUMMARY = 100;

/**
 * Generate and return a story, an imagePrompt and an imageBytes.
 *
 * `api` should have the same methods as `OpenAIApi`.
 */
export async function generateOpenAiStory(api, prompt, imagePromptPrompt) {
  const response = await completeStory(api, prompt);
  const stream = response.data;

  const [{ imagePrompt, imageBytes }, story] = await Promise.all([
    generateImage(api, prompt, stream, imagePromptPrompt),
    generateStory(stream),
  ]);

  return { imagePrompt, imageBytes, story };
}

function completeStory(api, prompt) {
  return api.createChatCompletion(
    {
      messages: [
        {
          role: "system",
          content: "Act as a professional writer for children.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "gpt-3.5-turbo",
      max_tokens: 1200,
      temperature: 1.0,
      frequency_penalty: 0.7,
      presence_penalty: 0.2,
      stream: true,
    },
    { responseType: "stream" }
  );
}

export async function generateImage(api, prompt, stream, imagePromptPrompt) {
  logger.debug("generateImage: summary generation started");
  const summary = await generateSummary(stream);
  logger.debug("generateImage: summary generated");

  logger.debug("generateImage: image prompt generation started");
  const imagePrompt = await generateImagePrompt(
    api,
    prompt,
    summary,
    imagePromptPrompt
  );
  logger.debug("generateImage: image prompt generated");

  logger.debug("generateImage: image generation started");
  const imageBytes = await generateImageBytes(api, imagePromptPrompt, 512);
  logger.debug("generateImage: image generated");

  return { imagePrompt, imageBytes };
}

export async function generateSummary(stream) {
  // Note: only the first resolve is used in a Promise
  return new Promise((resolve) => {
    let tokens = [];

    stream.on("data", (chunk) => {
      for (const token of parseChunk(chunk)) {
        tokens.push(token);
      }

      if (tokens.length === NUM_TOKENS_SUMMARY) {
        resolve(tokens.join(""));
      }
    });

    stream.on("end", () => {
      resolve(tokens.join(""));
    });
  });
}

function parseChunk(chunk) {
  const data = [];

  for (const line of splitChunk(chunk)) {
    try {
      const token = JSON.parse(line)?.choices?.[0]?.delta?.content;
      if (token !== null) {
        data.push(token);
      }
    } catch {
      logger.error("Error with data received from Open AI", line);
    }
  }

  return data;
}

function splitChunk(chunk) {
  return chunk
    ?.toString()
    ?.split("\n")
    .filter((line) => line.trim() !== "")
    .map((line) => line.replace(/^data: /, ""))
    .filter((line) => line !== "[DONE]");
}

async function generateImagePrompt(api, prompt, summary, imagePromptPrompt) {
  const response = await api.createChatCompletion({
    messages: [
      {
        role: "system",
        content: "Act as a professional illustrator for children.",
      },
      {
        role: "user",
        content: prompt,
      },
      {
        role: "assistant",
        content: summary,
      },
      {
        role: "user",
        content: imagePromptPrompt,
      },
    ],
    model: "gpt-3.5-turbo",
    max_tokens: 100,
    temperature: 0.4,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  return response.data.choices[0].message.content;
}

async function generateImageBytes(api, imagePrompt, size = 512) {
  const response = await api.createImage({
    prompt: imagePrompt,
    n: 1,
    size: `${size}x${size}`,
    response_format: "b64_json",
  });
  return Buffer.from(response.data.data[0].b64_json, "base64");
}

export async function generateStory(stream) {
  logger.debug("generateStory: started");

  let tokens = [];

  stream.on("data", async (chunk) => {
    for (const token of parseChunk(chunk)) {
      tokens.push(token);
    }
  });

  const storyIsComplete = new Promise((resolve) => {
    stream.on("end", () => {
      resolve();
    });
  });
  await storyIsComplete;
  logger.debug("generateStory: finished");

  return tokens.join("");
}
