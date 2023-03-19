import { Configuration, OpenAIApi } from "openai";

import { logger } from "firebase-functions";

import {
  getStoryTitle,
  getImagePromptPrompt,
  getPrompt,
} from "./story/story_params.js";

// Configure OpenAI API
const configuration = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);
const DEBUG = true;

const NUM_TOKENS_SUMMARY = 100;

export async function callOpenAi(storyParams) {
  var data = {
    title: getStoryTitle(storyParams),
    prompt: getPrompt(storyParams),
    promptForImagePrompt: getImagePromptPrompt(storyParams),
  };

  if (DEBUG === "true") {
    return {
      ...data,
      story: "test",
      imagePrompt: "sample image prompt",
      imageUrl: "https://avatars.githubusercontent.com/u/11032610?v=4",
    };
  }

  // Call OpenAi using stream data to parrallelize calls
  const start = performance.now();

  logger.info("Start OpenAI stream call");

  const result = await callOpenAiStream(
    data["prompt"],
    data["promptForImagePrompt"]
  );

  const end = performance.now();
  logger.info(`Total time for OpenAI calls: ${end - start} milliseconds.`);

  return {
    ...data,
    story: result.story,
    imagePrompt: result.imagePrompt,
    imageUrl: result.imageUrl,
  };
}

async function callOpenAiStream(storyPrompt, imagePromptPrompt) {
  let tokens = [];
  let storyIsComplete = false;
  const storyStream = await createStoryStream(storyPrompt);

  let createStoryImagePromise = null;

  storyStream.data.on("data", async (chunk) => {
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

        if (tokens.length == NUM_TOKENS_SUMMARY) {
          const summary = tokens.join("");
          createStoryImagePromise = createStoryImage(
            storyPrompt,
            summary,
            imagePromptPrompt
          );
          logger.debug("start createStoryImagePromise()");
        }
      }
    }
  });

  storyStream.data.on("close", () => {
    logger.debug("Story is complete.");
    storyIsComplete = true;
  });

  storyStream.data.on("error", (error) => {
    // TODO: check
    logger.error("Error with data received from Open AI", error);
  });

  while (createStoryImagePromise === null) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  logger.debug("createStoryImagePromise is not null");

  return createStoryImagePromise.then(async ({ imagePrompt, imageUrl }) => {
    while (!storyIsComplete) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    logger.debug("Story is complete inside createStoryImagePromise");

    const story = tokens.join("");
    return {
      story: story,
      imagePrompt: imagePrompt,
      imageUrl: imageUrl,
    };
  });
}

/**
 * @param {String} data
 * @returns
 */
function parseChunk(data) {
  return data
    ?.toString()
    ?.split("\n")
    .filter((line) => line.trim() !== "")
    .map((line) => line.replace(/^data: /, ""));
}

async function createStoryImage(prompt, summary, imagePromptPrompt) {
  const imagePrompt = await createImagePrompt(
    prompt,
    summary,
    imagePromptPrompt
  );
  const imageUrl = await createImage(imagePrompt, 512);
  return { imagePrompt: imagePrompt, imageUrl: imageUrl };
}

function createStoryStream(storyPrompt) {
  return openai.createChatCompletion(
    {
      messages: [
        {
          role: "system",
          content: "Act as a professional writer for children.",
        },
        {
          role: "user",
          content: storyPrompt,
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

function createImagePrompt(storyPrompt, summary, imagePromptPrompt) {
  return openai
    .createChatCompletion({
      messages: [
        {
          role: "system",
          content: "Act as a professional illustrator for children.",
        },
        {
          role: "user",
          content: storyPrompt,
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
    })
    .then((response) => {
      return response.data.choices[0].message.content;
    });
}

function createImage(prompt, size = 512) {
  return openai
    .createImage({
      prompt: prompt,
      n: 1,
      size: `${size}x${size}`,
    })
    .then((response) => response.data.data[0].url);
}

const character = {
  name: "Someone",
  type: "type",
  flaw: "has a flaw",
  power: "has a power",
  challenge: "being challenged",
};

const params = {
  style: "some style",
  character: character,
  place: "at some place",
  object: "some object",
  moral: "some moral",
  numWords: 300,
};

const storyPrompt = getPrompt(params);
const imagePromptPrompt = getImagePromptPrompt(params);
let result = await callOpenAiStream(storyPrompt, imagePromptPrompt);

console.log(result);
console.log(result["story"]);
