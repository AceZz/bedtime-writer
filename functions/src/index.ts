import { initializeApp } from "firebase-admin/app";
import { region } from "firebase-functions";
import { setGlobalOptions } from "firebase-functions/v2";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onCall } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";

import { getUid } from "./auth";
import { logger } from "./logger";
import {
  FirebaseStoryWriter,
  NPartStoryGenerator,
  StoryMetadata,
  CLASSIC_LOGIC,
} from "./story/";
import { StoryRequestV1Manager, StoryRequestV1 } from "./story/request";
import { BucketRateLimiter, RateLimiter } from "./rate_limiter";
import { FirestoreBucketRateLimiterStorage } from "./rate_limiter/bucket_rate_limiter/firestore_bucket_rate_limiter_storage";
import { parseEnvAsNumber as parseEnvNumber } from "./utils";
import { FirestoreUserStatsManager, UserStats } from "./user";
import { getImageApi, getTextApi } from "./api";
import { FirestorePaths } from "./firebase/firestore_paths";

initializeApp();

// Set Firestore paths
const firestorePaths = new FirestorePaths();

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

  const requestManager = new StoryRequestV1Manager(
    firestorePaths.story.stories
  );
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

    const requestManager = new StoryRequestV1Manager(
      firestorePaths.story.stories
    );
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
 * Initialize user stats in the user__stats collection from Firestore upon new user creation.
 */
export const initializeUserStats = region("europe-west6")
  .auth.user()
  .onCreate(async (user) => {
    const userStatsManager = new FirestoreUserStatsManager();

    const userStoriesLimit = parseEnvNumber("STORY_DAILY_LIMIT", 2);
    const initialUserStats = new UserStats(0, userStoriesLimit);

    await userStatsManager.setUserStats(user.uid, initialUserStats);
  });

/**
 * Resets the daily stories limit at a fixed schedule.
 */
export const resetDailyLimits = onSchedule("every day 01:00", async () => {
  logger.info("resetDailyLimits: started");
  const userStoriesLimit = parseEnvNumber("STORY_DAILY_LIMIT", 2);

  const userStatsManager = new FirestoreUserStatsManager();

  await userStatsManager.setAllRemainingStories(userStoriesLimit);
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
  const writer = new FirebaseStoryWriter(
    firestorePaths.story.stories,
    metadata,
    storyId
  );

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

    const userStatsManager = new FirestoreUserStatsManager();
    userStatsManager.updateStatsAfterStory(request.author);
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
