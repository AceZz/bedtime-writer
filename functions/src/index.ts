import process from "node:process";

import * as admin from "firebase-admin";
import { onCall } from "firebase-functions/v2/https";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { setGlobalOptions } from "firebase-functions/v2";
import { initializeApp } from "firebase-admin/app";

import FirebaseFunctionsRateLimiter from "firebase-functions-rate-limiter";

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
import { StoryRequestV1Manager, StoryRequestV1 } from "./story/request";

admin.initializeApp();

/**
 * Access the Firestore database and set requests rate-limiters
 */
const firestore = admin.firestore();

const limiter = FirebaseFunctionsRateLimiter.withFirestoreBackend(
  {
      name: "rate_limiter_global_collection",
      maxCalls: 1,
      periodSeconds: 600,
  },
  firestore,
);

/**
 * Set the default region and secrets for all functions.
 */
setGlobalOptions({ region: "europe-west6", secrets: ["OPENAI_API_KEY"] });

/**
 * Request a story. See `StoryRequestV1` for the expected fields (except
 * `author`).
 *
 * Return the ID of the story.
 */
export const createClassicStoryRequest = onCall(async (request) => {

  //Check first limiter
  await limiter.rejectOnQuotaExceededOrRecordUsage();

  request.data.author = getUid(request.auth);

  const requestManager = new StoryRequestV1Manager();
  const id = await requestManager.create(CLASSIC_LOGIC, request.data);

  return id;
});

/**
 * Listen to the stories collection in Firestore and create the appropriate
 * story.
 */
export const createStory = onDocumentCreated(
  "stories/{story_id}",
  async (event) => {
    if (event.data === null || event.data === undefined) {
      throw new Error("Event data is null or undefined");
    }
    const storyId = event.data.id;

    const requestManager = new StoryRequestV1Manager();
    const request = await requestManager.get(storyId);

    if (request.logic == CLASSIC_LOGIC) {
      return createClassicStory(storyId, request); //TODO: check here
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
