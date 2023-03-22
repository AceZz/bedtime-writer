import * as dotenv from "dotenv";
dotenv.config();

import { get } from "https";
import { pipeline } from "stream/promises";
import process from "node:process";

import { firestore, https, logger } from "firebase-functions";
import { initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
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
const storageBucket = getStorage().bucket();

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
 */
export const addStory = https.onCall(async (storyParams, context) => {
  let api;
  const uid = getUid(context);

  if (process.env.FAKE_DATA === "true") {
    logger.info("addStory: using fake data");
    api = fakeOpenAi;
  } else {
    logger.info("addStory: using Open AI data");
    api = openAi;
  }

  let payload = getStoryTitleAndPrompt(storyParams);
  payload = {
    ...payload,
    ...(await generateOpenAiStory(
      api,
      payload.prompt,
      payload.imagePromptPrompt
    )),
  };
  logger.info("addStory: story was generated");

  const storyId = await addToFirestore(payload, uid);
  logger.info(`addStory: story ${storyId} was added to Firestore`);

  return storyId;
});

function getStoryTitleAndPrompt(storyParams) {
  return {
    title: getStoryTitle(storyParams),
    prompt: getPrompt(storyParams),
    imagePromptPrompt: getImagePromptPrompt(storyParams),
  };
}

async function addToFirestore(result, uid) {
  const payload = getFirestoreStoryPayload(result, uid);
  const document = await storiesRef.add(payload);
  return document.id;
}

function getFirestoreStoryPayload(result, uid) {
  return {
    author: uid,
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
    logger.info(
      `downloadStoryImage: image of story ${snapshot.id} was saved to Storage`
    );

    await setStoryImageMetadata(data.author, storyImageFile);
    logger.info(`Metadata of story image ${snapshot.id} was updated`);

    await setStoryImagePath(snapshot.id, storyImagePath);
    logger.info(
      `downloadStoryImage: storage cloud image path of story ${snapshot.id} was updated`
    );
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

async function setStoryImageMetadata(author, storyImageFile) {
  return storyImageFile.setMetadata({
    metadata: { author: author },
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

