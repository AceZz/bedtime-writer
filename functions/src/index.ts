import process from "node:process";

import { region } from "firebase-functions";
import { initializeApp } from "firebase-admin/app";

import {
  getOpenAiApi,
  OpenAiTextApi,
  OpenAiImageApi,
  FakeTextApi,
  FakeImageApi,
} from "./api";
import { getUid } from "./auth";
import { logger } from "./logger";
import {
  FirebaseStorySaver,
  OnePartStoryGenerator,
  StoryMetadata,
  ImageApi,
  TextApi,
} from "./story/";

initializeApp();

/**
 * Add a story.
 *
 * This call expects story parameters.
 * It returns the ID of the created document.
 */
export const addStory = region("europe-west1")
  .runWith({ secrets: ["OPENAI_API_KEY"] })
  .https.onCall(async (storyParams, context) => {
    const uid = getUid(context);
    const { textApi, imageApi } = getApis();

    const generator = new OnePartStoryGenerator(storyParams, textApi, imageApi);
    const metadata = new StoryMetadata(uid, generator.title());
    const saver = new FirebaseStorySaver(metadata);

    const part = await generator.nextStoryPart();
    logger.info("addStory: story was generated");

    const id = await saver.createStory();
    await saver.savePart(part);
    logger.info(`addStory: story ${id} was added to Firestore`);

    return id;
  });

function getApis(): { textApi: TextApi; imageApi: ImageApi } {
  if (process.env.FAKE_DATA === "true") {
    logger.info("using fake data");
    return {
      textApi: new FakeTextApi(),
      imageApi: new FakeImageApi(),
    };
  }

  const openAiApi = getOpenAiApi(process.env.OPENAI_API_KEY);
  return {
    textApi: new OpenAiTextApi(openAiApi, "gpt-3.5-turbo"),
    imageApi: new OpenAiImageApi(openAiApi),
  };
}
