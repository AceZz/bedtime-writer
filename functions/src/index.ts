import process from "node:process";

import { initializeApp } from "firebase-admin/app";
import { firestore } from "firebase-admin";
import { auth } from "firebase-functions";
import { setGlobalOptions } from "firebase-functions/v2";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onCall } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";

import { getUid } from "./auth";
import { logger } from "./logger";
import { updateRemainingStories } from "./stats";
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
import { BucketRateLimiter, RateLimiter } from "./rate_limiter";
import { FirestoreBucketRateLimiterStorage } from "./rate_limiter/bucket_rate_limiter/firestore_bucket_rate_limiter_storage";
import { parseEnvAsNumber as parseEnvNumber } from "./utils";

initializeApp();

const firestore_db = firestore();

// Set the default region.
setGlobalOptions({ region: "europe-west6" });

/**
 * Request a story. See `StoryRequestV1` for the expected fields (except
 * `author`).
 *
 * Return the ID of the story.
 */
export const createClassicStoryRequest = onCall(async (request) => {
  request.data.author = getUid(request.auth);
  const userRateLimiter = getRateLimiter(
    parseEnvNumber("RATE_LIMITER_MAX_REQUESTS_PER_DAY_USER", 50)
  );
  await userRateLimiter.addRequests(request.data.author, ["story"]);

  const globalRateLimiter = getRateLimiter(
    parseEnvNumber("RATE_LIMITER_MAX_REQUESTS_PER_DAY_GLOBAL", 1000)
  );
  await globalRateLimiter.addRequests("global", ["story"]);

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
 * Initialize user stats in the users collection from Firestore upon new user creation.
 */
export const initializeUserStats = auth.user().onCreate(async (user) => {
  const userStoriesLimit = Number(process.env.USER_STORIES_LIMIT) ?? 2;

  // Retrieve user document.
  const userRef = firestore_db.collection("users").doc(user.uid);
  const userSnapshot = await userRef.get();
  const userSnapshotData = userSnapshot.data();

  // If no user data is found, add this user to the collection with maximal daily remaining stories.
  let userData;
  if (!userSnapshotData) {
    userData = {
      numStories: 0,
      remainingStories: userStoriesLimit,
    };
    await userRef.set(userData);
  }
});

//TODO: test it
// This function resets the daily requests count for all users at midnight
export const resetDailyRequests = onSchedule("every day 00:00", async () => {
  const usersSnapshot = await firestore_db.collection("users").get();

  // Batch write for efficiency
  const batch = firestore_db.batch();

  usersSnapshot.docs.forEach((doc) => {
    const userRef = firestore_db.collection("users").doc(doc.id);

    batch.update(userRef, {
      remainingStories: process.env.USER_STORIES_LIMIT ?? 2,
    });
  });

  await batch.commit();

  //TODO: do a separate log for success and for error
  console.log("Successfully reset daily requests count for all users.");
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
  const generator = new NPartStoryGenerator(logic, textApi, imageApi);
  const metadata = new StoryMetadata(request.author, generator.title());
  const writer = new FirebaseStoryWriter(metadata, storyId);

  await writer.writeMetadata();

  try {
    // Write story to database part after part
    for await (const part of generator.storyParts()) {
      await writer.writePart(part);
    }
    await writer.writeComplete();
    logger.info(
      `createClassicStory: story ${storyId} was generated and added to Firestore`
    );
    // Update remaining stories for the user
    await updateRemainingStories(request.author, firestore_db); //TODO: understand why this throws an error
    logger.info(
      `createClassicStory: remaining daily stories for user ${request.author} were succesfully updated`
    );
  } catch (error) {
    await writer.writeError();
    logger.error(
      `createClassicStory: story ${storyId} created by user ${request.author} encountered an error: ${error}`
    );
  }
}

function getRateLimiter(limit: number): RateLimiter {
  return new BucketRateLimiter(
    new FirestoreBucketRateLimiterStorage(),
    new Map([["story", limit]]),
    new Map([["story", 24 * 3600]])
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
