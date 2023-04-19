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
  FirebaseStorySaver,
  OnePartStoryGenerator,
  StoryMetadata,
  ImageApi,
  TextApi,
  CLASSIC_LOGIC,
} from "./story/";
import { getOpenAiApi } from "./open_ai";
import {
  StoryRequestStatus,
  StoryRequestV1Manager,
  StoryRequestV1,
} from "./story/request";

initializeApp();

/**
 * Request a story. See `StoryRequestV1` for the expected fields (except
 * `author`).
 *
 * Return the ID of the story (which will likely not be available until a few
 * seconds).
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
 * Listen to the requests collection in Firestore and create the appropriate
 * story.
 */
export const createStory = region("europe-west1")
  .runWith({ secrets: ["OPENAI_API_KEY"] })
  .firestore.document("requests_v1/{request_id}")
  .onCreate(async (snapshot) => {
    const requestId = snapshot.id;

    const requestManager = new StoryRequestV1Manager();
    const request = await requestManager.get(requestId);

    if (request.logic == CLASSIC_LOGIC) {
      createClassicStory(requestId, request);
    } else {
      throw new Error(`Unrecognized logic ${request.logic}.`);
    }
  });

/**
 * Generate a classic story and add it to Firestore.
 *
 * The ID of the generated story is the same as the request ID.
 */
async function createClassicStory(requestId: string, request: StoryRequestV1) {
  // Transform the request into a `ClassicStoryLogic`.
  const logic = request.toClassicStoryLogic();
  const { textApi, imageApi } = getApis();

  // Generate the story.
  const generator = new OnePartStoryGenerator(logic, textApi, imageApi);
  const metadata = new StoryMetadata(request.author, generator.title());
  const part = await generator.nextStoryPart();
  logger.info("createClassicStory: story was generated");

  // Save the story.
  const saver = new FirebaseStorySaver(metadata, requestId);
  await saver.writeMetadata();
  await saver.writePart(part);

  const requestManager = new StoryRequestV1Manager();
  requestManager.updateStatus(requestId, StoryRequestStatus.CREATED);

  logger.info(`createClassicStory: story ${requestId} was added to Firestore`);
}

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
