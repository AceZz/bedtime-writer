import process from "node:process";

import { region } from "firebase-functions";
import { initializeApp } from "firebase-admin/app";

import { getUid } from "./auth";
import { logger } from "./logger";
import {
  OpenAiTextApi,
  OpenAiImageApi,
  FakeTextApi,
  FakeImageApi,
  FirebaseStoryWriter,
  OnePartStoryGenerator,
  StoryMetadata,
  ImageApi,
  TextApi,
  CLASSIC_LOGIC,
} from "./story/";
import { getOpenAiApi } from "./open_ai";
import { StoryRequestV1Manager, StoryRequestV1 } from "./story/request";

initializeApp();

/**
 * Request a story. See `StoryRequestV1` for the expected fields (except
 * `author`).
 *
 * Return the ID of the story.
 */
export const createClassicStoryRequest = region("europe-west1").https.onCall(
  async (data, context) => {
    data.author = getUid(context);

    const requestManager = new StoryRequestV1Manager();
    const id = await requestManager.create(CLASSIC_LOGIC, data);

    return id;
  }
);

/**
 * Listen to the stories collection in Firestore and create the appropriate
 * story.
 */
export const createStory = region("europe-west1")
  .runWith({ secrets: ["OPENAI_API_KEY"] })
  .firestore.document("stories/{story_id}")
  .onCreate(async (snapshot) => {
    const storyId = snapshot.id;

    const requestManager = new StoryRequestV1Manager();
    const request = await requestManager.get(storyId);

    if (request.logic == CLASSIC_LOGIC) {
      createClassicStory(storyId, request);
    } else {
      throw new Error(`Unrecognized logic ${request.logic}.`);
    }
  });

/**
 * Generate a classic story and add it to Firestore.
 */
async function createClassicStory(storyId: string, request: StoryRequestV1) {
  // Transform the request into a `ClassicStoryLogic`.
  const logic = request.toClassicStoryLogic();
  const textApi = getTextApi();
  const imageApi = getImageApi();

  // Generate and save the story.
  const generator = new OnePartStoryGenerator(logic, textApi, imageApi);
  const metadata = new StoryMetadata(request.author, generator.title());
  const writer = new FirebaseStoryWriter(metadata, storyId);

  await writer.writeMetadata();

  for await (const part of generator.storyParts()) {
    await writer.writePart(part);
  }

  writer.writeComplete();
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
