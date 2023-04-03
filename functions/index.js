import * as dotenv from "dotenv";
dotenv.config();

import process from "node:process";

import { region, logger } from "firebase-functions";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { Configuration, OpenAIApi } from "openai";

import { getUid } from "./auth.js";
import { compressPNG } from "./utils.js";
import { fakeOpenAi } from "./story/fake_open_ai.js";
import { generateOpenAiStory } from "./story/open_ai.js";
import {
  getStoryTitle,
  getImagePromptPrompt,
  getPrompt,
} from "./story/story_params.js";

initializeApp();

// These parameters were found with a benchmark on OpenAI data.
const IMAGE_COMPRESSION_PARAMETERS = {
  effort: 3,
  compressionLevel: 6,
};

const storiesRef = getFirestore().collection("stories");

/**
 * Add a story.
 *
 * This call expects story parameters.
 * It returns the ID of the created Firestore document.
 *
 * The Firestore document has the following schema:
 *
 * stories/
 *   <story_id>
 *     author
 *     text
 *     timestamp
 *     title
 *     isFavorite
 *     images/
 *       512x512
 *         data
 *     sources/
 *       text
 *         prompt
 *       image
 *         prompt
 */
export const addStory = region("europe-west1")
  .runWith({ secrets: ["OPENAI_API_KEY"] })
  .https.onCall(async (storyParams, context) => {
    const api = getApi(process.env.OPENAI_API_KEY);
    const uid = getUid(context);

    let story = getStoryTitleAndPrompt(storyParams);
    story = {
      ...story,
      ...(await generateOpenAiStory(
        api,
        story.prompt,
        story.imagePromptPrompt
      )),
    };
    logger.info("addStory: story was generated");

    const storyId = await addStoryToFirestore(story, uid);
    logger.info(`addStory: story ${storyId} was added to Firestore`);

    return storyId;
  });

function getApi(openAiApiKey) {
  if (process.env.FAKE_DATA === "true") {
    logger.info("using fake data");
    return fakeOpenAi;
  }

  const k = `${openAiApiKey.slice(0, 3)}...${openAiApiKey.slice(-4)}`;
  logger.info(`using Open AI data, with API key ${k}`);
  return new OpenAIApi(
    new Configuration({
      apiKey: openAiApiKey,
    })
  );
}

function getStoryTitleAndPrompt(storyParams) {
  return {
    title: getStoryTitle(storyParams),
    prompt: getPrompt(storyParams),
    imagePromptPrompt: getImagePromptPrompt(storyParams),
  };
}

async function addStoryToFirestore(story, uid) {
  const document = await addStoryDocumentToFirestore(story, uid);
  await addStoryImageToFirestore(document, story);
  await addStoryPromptsToFirestore(document, story);

  return document.id;
}

async function addStoryDocumentToFirestore(story, uid) {
  const payload = {
    author: uid,
    timestamp: Timestamp.now(),
    title: story.title,
    text: story.story.trim(),
    isFavorite: false,
  };
  return await storiesRef.add(payload);
}

async function addStoryImageToFirestore(document, story) {
  const payload = { data: await compressImage(story.imageBytes) };
  await document.collection("images").doc("512x512").set(payload);
}

async function compressImage(image) {
  const compressedImage = await compressPNG(
    image,
    IMAGE_COMPRESSION_PARAMETERS
  );

  const originalSize = Math.round(image.length / 1000);
  const compressedSize = Math.round(compressedImage.length / 1000);

  if (originalSize < compressedSize) {
    logger.log(
      `compressImage: original = ${originalSize} kB, compressed = ${compressedSize} kB, use original.`
    );
    return image;
  }

  logger.log(
    `compressImage: original = ${originalSize} kB, compressed = ${compressedSize} kB, use compressed.`
  );
  return compressedImage;
}

async function addStoryPromptsToFirestore(document, story) {
  await document.collection("sources").doc("text").set({
    prompt: story.prompt,
  });
  await document.collection("sources").doc("image").set({
    prompt: story.imagePrompt,
  });
}
