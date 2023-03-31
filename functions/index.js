import * as dotenv from "dotenv";
dotenv.config();

import process from "node:process";

import { region, logger } from "firebase-functions";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { Configuration, OpenAIApi } from "openai";

import { getUid } from "./auth.js";
import { fakeOpenAi } from "./story/fake_open_ai.js";
import { generateOpenAiStory } from "./story/open_ai.js";
import {
  getStoryTitle,
  getImagePromptPrompt,
  getPrompt,
} from "./story/story_params.js";

initializeApp();

const storiesRef = getFirestore().collection("stories");

const openAi = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

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
export const addStory = region("europe-west1").https.onCall(
  async (storyParams, context) => {
    let api;
    const uid = getUid(context);

    if (process.env.FAKE_DATA === "true") {
      logger.info("addStory: using fake data");
      api = fakeOpenAi;
    } else {
      logger.info("addStory: using Open AI data");
      api = openAi;
    }

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
  }
);

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
  const payload = { data: story.imageBytes };
  await document.collection("images").doc("512x512").set(payload);
}

async function addStoryPromptsToFirestore(document, story) {
  await document.collection("sources").doc("text").set({
    prompt: story.prompt,
  });
  await document.collection("sources").doc("image").set({
    prompt: story.imagePrompt,
  });
}
