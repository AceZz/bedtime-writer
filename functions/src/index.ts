import process from "node:process";

import { initializeApp } from "firebase-admin/app";
import { firestore } from "firebase-admin";
import { onCall } from "firebase-functions/v2/https";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { setGlobalOptions } from "firebase-functions/v2";

import { getUid } from "./auth";
import { logger } from "./logger";
import {
  OpenAiTextApi,
  OpenAiImageApi,
  FakeTextApi,
  FakeImageApi,
  FirebaseStoryWriter,
  NPartStoryGenerator,
  StoryMetadata,
  ImageApi,
  TextApi,
  CLASSIC_LOGIC,
} from "./story/";
import { getOpenAiApi } from "./open_ai";
import {
  StoryRequestV1Manager,
  StoryRequestV1,
  storyRequestLimiter,
} from "./story/request";

initializeApp();

// Set the default region.
setGlobalOptions({ region: "europe-west6" });

// Initialize the database.
const firestore_database = firestore();

/**
 * Request a story. See `StoryRequestV1` for the expected fields (except
 * `author`).
 *
 * Return the ID of the story.
 */
export const createClassicStoryRequest = onCall(async (request) => {
  request.data.author = getUid(request.auth);

  // Check against rate limits
  await storyRequestLimiter(firestore_database, request.data.author);

  const requestManager = new StoryRequestV1Manager();
  const id = await requestManager.create(CLASSIC_LOGIC, request.data);

  return id;
});

/**
 * Listen to the stories collection in Firestore and create the appropriate
 * story.
 */
export const createStory = onDocumentCreated(
  { document: "stories/{story_id}", secrets: ["OPENAI_API_KEY"] },
  async (event) => {
    if (event.data === null || event.data === undefined) {
      throw new Error("Event data is null or undefined");
    }
    const storyId = event.data.id;

    const requestManager = new StoryRequestV1Manager();
    const request = await requestManager.get(storyId);

    if (request.logic == CLASSIC_LOGIC) {
      return createClassicStory(storyId, request);
    } else {
      throw new Error(
        `Story id ${storyId}: unrecognized logic ${request.logic}.`
      );
    }
  }
);

/**
 * Generate a classic story and add it to Firestore.
 */
async function createClassicStory(storyId: string, request: StoryRequestV1) {
  // Transform the request into a `ClassicStoryLogic`.
  const logic = request.toClassicStoryLogic();
  const textApi = getTextApi();
  const imageApi = getImageApi();

  // Generate and save the story.
  const generator = new NPartStoryGenerator(logic, textApi, imageApi);
  const metadata = new StoryMetadata(request.author, generator.title());
  const writer = new FirebaseStoryWriter(metadata, storyId);

  await writer.writeMetadata();

  for await (const part of generator.storyParts()) {
    await writer.writePart(part);
  }

  await writer.writeComplete();

  logger.info(
    `createClassicStory: story ${storyId} was generated and added to Firestore`
  );
}

function getTextApi(): TextApi {
  if (process.env.TEXT_API?.toLowerCase() === "fake") {
    logger.info("using FakeTextApi");
    return new FakeTextApi();
  }

  logger.info("using OpenAiTextApi");
  return new OpenAiTextApi(
    getOpenAiApi(process.env.OPENAI_API_KEY),
    "gpt-3.5-turbo"
  );
}

function getImageApi(): ImageApi {
  if (process.env.IMAGE_API?.toLowerCase() === "fake") {
    logger.info("using FakeImageApi");
    return new FakeImageApi();
  }

  logger.info("using OpenAiImageApi");
  return new OpenAiImageApi(getOpenAiApi(process.env.OPENAI_API_KEY));
}
