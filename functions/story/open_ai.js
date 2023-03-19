import { Configuration, OpenAIApi } from "openai";

import { logger } from "firebase-functions";

import * as dotenv from "dotenv";
dotenv.config();

import {
  getStoryTitle,
  getImagePromptPrompt,
  getPrompt,
} from "./story_params.js";

import process from "node:process";
import { waitFor as waitUntil } from "../utils.js";

const NUM_TOKENS_SUMMARY = 100;
const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

export async function generateOpenAiStory(prompt, imagePromptPrompt) {
  let tokens = [];
  let storyIsComplete = false;
  const stream = await createStream(prompt);

  let imagePromise = null;

  stream.data.on("data", async (chunk) => {
    for (const data of parseChunk(chunk)) {
      if (data !== "[DONE]") {
        try {
          const token = JSON.parse(data)?.choices?.[0]?.delta?.content;
          if (token !== null) {
            tokens.push(token);
          }
        } catch {
          logger.error("Error with data received from Open AI", data);
        }

        if (imagePromise == null && tokens.length == NUM_TOKENS_SUMMARY) {
          const summary = tokens.join("");
          imagePromise = createImage(prompt, summary, imagePromptPrompt);
          logger.debug("imagePromise() started");
        }
      }
    }
  });

  stream.data.on("close", () => {
    logger.debug("Story generated");
    storyIsComplete = true;
  });

  stream.data.on("error", (error) => {
    // TODO: check
    logger.error("Error with data received from Open AI", error);
  });

  waitUntil(() => imagePromise !== null);
  logger.debug("createStoryImagePromise is not null");

  return imagePromise.then(async ({ imagePrompt, imageUrl }) => {
    waitUntil(() => storyIsComplete);
    logger.debug("Story is complete inside createStoryImagePromise");

    return {
      story: tokens.join(""),
      imagePrompt: imagePrompt,
      imageUrl: imageUrl,
    };
  });
}

function createStream(prompt) {
  return openai.createChatCompletion(
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

function parseChunk(data) {
  return data
    ?.toString()
    ?.split("\n")
    .filter((line) => line.trim() !== "")
    .map((line) => line.replace(/^data: /, ""));
}

/***
 * ...
 */

async function callOpenAiStream(prompt, promptForImagePrompt) {
  // Initialize stream
  const completion = await openai.createChatCompletion(
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

  return new Promise(async (resolve) => {
    let story = "";
    // Initialize story
    let imageData;
    let tokenCounter = 0;
    completion.data.on("data", async (data) => {
      const lines = extractLines(data);
      for (const line of lines) {
        const message = line.replace(/^data: /, "");
        // End the stream if message "[DONE]" is received
        if (message == "[DONE]") {
          logger.info("OpenAI stream message done received");
          imageData = await imageData;
          let result = {
            story: story,
            imagePrompt: imageData.imagePrompt,
            imageUrl: imageData.imageUrl,
          };
          resolve(result);
          // Else continue listening to the stream
        } else {
          let token;
          try {
            token = JSON.parse(message)?.choices?.[0]?.delta?.content;
            // Test if token had a value for content field, ie is a piece of the story
            if (token != null) {
              story += token;
            }
            tokenCounter++;
          } catch {
            logger.error("ERROR in token receiving from OpenAI stream", json);
          }
          if (tokenCounter == numTokenStartImagePrompt) {
            imageData = callOpenAiPromptAndImage(
              prompt,
              story,
              promptForImagePrompt
            );
          }
        }
      }
    });
  });
}

function extractLines(data) {
  return data
    ?.toString()
    ?.split("\n")
    .filter((line) => line.trim() !== "");
}

async function callOpenAiPromptAndImage(prompt, story, promptForImagePrompt) {
  const imagePrompt = await callOpenAiCompletionsForImagePrompt(
    prompt,
    story,
    promptForImagePrompt
  );
  const imageUrl = await callOpenAiImagesGeneration(imagePrompt, 512);
  return { imagePrompt: imagePrompt, imageUrl: imageUrl };
}

function callOpenAiCompletionsForImagePrompt(
  prompt,
  story,
  promptForImagePrompt
) {
  return openai
    .createChatCompletion({
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
          content: story,
        },
        {
          role: "user",
          content: promptForImagePrompt,
        },
      ],
      model: "gpt-3.5-turbo",
      max_tokens: 100,
      temperature: 0.4,
      frequency_penalty: 0,
      presence_penalty: 0,
    })
    .then((response) => {
      // TODO: understand why this returns undefined
      return response.data.choices[0].message.content;
    });
}

function callOpenAiImagesGeneration(imagePrompt, size = 512) {
  return openai
    .createImage({
      prompt: imagePrompt,
      n: 1,
      size: `${size}x${size}`,
    })
    .then((response) => response.data.data[0].url);
}
