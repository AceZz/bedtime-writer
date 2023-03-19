import * as dotenv from "dotenv";
dotenv.config();

import { get } from "https";
import { pipeline } from "stream/promises";
import process from "node:process";

import { firestore, https, logger } from "firebase-functions";
import { initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

import { callOpenAi } from "./story/open_ai.js";
import {
  getStoryTitle,
  getImagePromptPrompt,
  getPrompt,
} from "./story/story_params.js";

initializeApp();

const storiesRef = getFirestore().collection("stories");
const storageBucket = getStorage().bucket();

/**
 * Add a story.
 *
 * This call expects story parameters.
 * It returns the ID of the created Firestore document.
 */
export const addStory = https.onCall(async (storyParams) => {
  let story;
  if (process.env.FAKE_DATA === "true") {
    logger.info("Generate fake data");
    story = generateFakeStory(storyParams);
  } else {
    logger.info("Generate Open AI data");
    story = await callOpenAi(storyParams);
    logger.info("Open AI data was generated");
  }

  const storyId = await addToFirestore(story);
  logger.info(`Story ${storyId} was added to Firestore`);

  return storyId;
});

function generateFakeStory(storyParams) {
  return {
    ...getStoryTitleAndPrompt(storyParams),
    story: "sample story",
    imagePrompt: "sample imagePrompt",
    imageUrl: "https://avatars.githubusercontent.com/u/11032610?v=4",
  };
}

function getStoryTitleAndPrompt(storyParams) {
  return {
    title: getStoryTitle(storyParams),
    prompt: getPrompt(storyParams),
    imagePromptPrompt: getImagePromptPrompt(storyParams),
  };
}

async function addToFirestore(result) {
  const payload = getFirestoreStoryPayload(result);
  const document = await storiesRef.add(payload);
  return document.id;
}

function getFirestoreStoryPayload(result) {
  return {
    date: Timestamp.now(),
    title: result.title,
    text: result.story.trim(),
    prompt: result.prompt,
    imagePrompt: result.imagePrompt,
    image: {
      providerUrl: result.imageUrl,
    },
  };
}

/**
 * This function is triggered when a story is added to Firestore.
 * It downloads the story image to Cloud Storage, then replaces the image URL
 * in Firestore.
 */
export const downloadStoryImage = firestore
  .document("stories/{storyId}")
  .onCreate(async (snapshot) => {
    const storyImagePath = getStoryImagePath(snapshot.id);

    const data = snapshot.data();
    const storyImageFile = storageBucket.file(storyImagePath);
    await saveStoryImageToStorage(data.image.providerUrl, storyImageFile);
    logger.info(`Image of story ${snapshot.id} was saved to Storage`);

    await setStoryImagePath(snapshot.id, storyImagePath);
    logger.info(`Storage cloud image path of story ${snapshot.id} was updated`);
  });

function getStoryImagePath(storyId) {
  return `stories/image/${storyId}.png`;
}

async function saveStoryImageToStorage(url, storyImageFile) {
  const fileStream = storyImageFile.createWriteStream();

  return new Promise((resolve, reject) => {
    get(url, async (result) => {
      await pipeline(result, fileStream);
      resolve();
    }).on("error", reject);
  });
}

async function setStoryImagePath(storyId, storyImagePath) {
  const document = storiesRef.doc(storyId);
  const data = await document.get();

  return await document.update({
    image: {
      ...data.data().image,
      cloudStoragePath: storyImagePath,
    },
  });
}

