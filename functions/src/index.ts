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
  StoryRequestV1Manager,
  StoryRequestV1,
} from "./story";
import {
  BucketRateLimiter,
  RateLimiter,
  FirestoreBucketRateLimiterStorage,
} from "./rate_limiter";
import { parseEnvAsNumber as parseEnvNumber } from "./utils";
import {
  FirebaseUserFeedbackManager,
  FirestoreUserStatsManager,
  UserFeedback,
  UserStats,
} from "./user";
import { getImageApi, getTextApi } from "./api";
import { FirestorePaths, FirestoreStoryRealtime } from "./firebase";
import { FirestoreUserFeedback } from "./firebase/firestore_user_feedback";

initializeApp();

// Set Firestore paths and helpers
const firestorePaths = new FirestorePaths();
const firestoreStoryRealtime = new FirestoreStoryRealtime(firestorePaths);

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

  const requestManager = new StoryRequestV1Manager(firestoreStoryRealtime);
  const id = await requestManager.create(CLASSIC_LOGIC, request.data);

  return id;
});

/**
 * Listen to the stories collection in Firestore and create the appropriate
 * story.
 */
export const createStory = onDocumentCreated(
  {
    document: `${firestorePaths.story.realtime}/{story_id}`,
    secrets: ["OPENAI_API_KEY"],
  },
  async (event) => {
    if (event.data === null || event.data === undefined) {
      throw new Error("Event data is null or undefined");
    }
    const storyId = event.data.id;

    const requestManager = new StoryRequestV1Manager(firestoreStoryRealtime);
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
    firestoreStoryRealtime,
    metadata,
    storyId
  );

  await writer.writeFromGenerator(generator);

  const userStatsManager = new FirestoreUserStatsManager();
  await userStatsManager.updateStatsAfterStory(request.author);
}

/**
 * Collect the user feedback and write it in the database.
 */
export const collectUserFeedback = onCall(async (request) => {
  const data = request.data;

  const text = data.text;
  console.log(data.datetime);
  const datetime = new Date(data.datetime);
  console.log(datetime);
  const uid = getUid(request.auth);

  const feedback = new UserFeedback(text, datetime, uid);

  const feedbackCollection = new FirestoreUserFeedback();
  const feedbackManager = new FirebaseUserFeedbackManager(feedbackCollection);

  await feedbackManager.write(feedback);
});

function getRateLimiter(limit: number): RateLimiter {
  return new BucketRateLimiter(
    new FirestoreBucketRateLimiterStorage(),
    new Map([["story", limit]]),
    new Map([["story", 24 * 3600]])
  );
}
