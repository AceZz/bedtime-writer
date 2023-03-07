import * as dotenv from "dotenv";
dotenv.config();

import { get } from "https";
import process from "node:process";

import { https } from "firebase-functions";
import { initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

import {
  callOpenAiCompletions,
  callOpenAiCompletionsForImagePrompt,
  callOpenAiImagesGeneration,
} from "./story/open_ai.js";
import {
  getStoryTitle,
  getPromptForImagePrompt,
  getImagePrompt,
  getPrompt,
} from "./story/story_params.js";

initializeApp();

const firestore = getFirestore();
const storiesRef = firestore.collection("stories");

const storage = getStorage();
const storageBucket = storage.bucket();

/**
 * Add a story.
 *
 * This call expects story parameters.
 * It returns the ID of the created Firestore document.
 */
export const addStory = https.onCall(async (storyParams) => {
  const result = await callOpenAi(storyParams);
  const storyId = await addToFirestore(result);
  await uploadToStorage(result.imageUrl, storyId);
  return storyId;
});

async function callOpenAi(storyParams) {
  var data = {
    title: getStoryTitle(storyParams),
    prompt: getPrompt(storyParams),
    promptForImagePrompt: getPromptForImagePrompt(storyParams),
  };

  if (process.env.DEBUG === "true") {
    return {
      ...data,
      story: "test",
      imageUrl: "https://avatars.githubusercontent.com/u/11032610?v=4",
    };
  }

// Call callOpenAiCompletions first, and then callOpenAiImagesGeneration with the result as an argument
  const story = await callOpenAiCompletions(data.prompt);
  const imagePrompt = await callOpenAiCompletionsForImagePrompt(data.prompt, story, data.promptForImagePrompt);
  const imageUrl = await callOpenAiImagesGeneration(imagePrompt, 512);

  return {
    ...data,
    story: story,
    imagePrompt: imagePrompt,
    imageUrl: imageUrl,
  };
}

async function addToFirestore(result) {
  const data = {
    date: Timestamp.now(),
    title: result.title,
    text: result.story.trim(),
    prompt: result.prompt,
    promptForImagePrompt: result.promptForImagePrompt,
    imagePrompt: result.imagePrompt,
  };
  return await storiesRef.add(data).then((document) => document.id);
}

async function uploadToStorage(url, storyId) {
  const file = storageBucket.file(`stories/image/${storyId}.png`);
  const stream = file.createWriteStream();

  return new Promise((resolve, reject) => {
    get(url, (res) => {
      res.pipe(stream);
      resolve();
    }).on("error", () => reject);
  });
}

