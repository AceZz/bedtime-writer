import { initializeApp } from "firebase-admin/app";
import { region } from "firebase-functions";
import { setGlobalOptions } from "firebase-functions/v2";
import { onCall } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";

import { getUid } from "./auth";
import { logger } from "./logger";
import { parseEnvAsNumber, pickRandom } from "./utils";
import {
  FirebaseUserFeedbackManager,
  FirebaseUserStatsManager,
  FirebaseUserStoriesManager,
  UserFeedback,
  UserStats,
} from "./user";
import { FirebaseStoryReader, FirestoreContext } from "./firebase";
import {
  BucketRateLimiter,
  FirestoreBucketRateLimiterStorage,
  RateLimiter,
} from "./rate_limiter";

initializeApp();

// Set Firestore paths.
const firestore = new FirestoreContext();

// Set the default region.
setGlobalOptions({ region: "europe-west6" });

/**
 * Create a classic story for a user.
 *
 * Returns the story id. It matches the cache with
 * the answers in the request and adds the story
 * id to the user's list of stories.
 */
export const createClassicStory = onCall(async (request) => {
  // Check limit rate
  const uid = getUid(request.auth);
  const userRateLimiter = getRateLimiter(
    parseEnvAsNumber("RATE_LIMITER_MAX_REQUESTS_PER_DAY_USER", 50)
  );
  await userRateLimiter.addRequests(uid, ["story"]);

  const globalRateLimiter = getRateLimiter(
    parseEnvAsNumber("RATE_LIMITER_MAX_REQUESTS_PER_DAY_GLOBAL", 1000)
  );
  await globalRateLimiter.addRequests("global", ["story"]);

  // Retrieve the story
  const answers = request.data;
  const reader = new FirebaseStoryReader(firestore.storyCacheServing);
  const filter = { request: answers };
  const storyIds = await reader.getIds(filter);

  if (storyIds.length === 0) {
    const error = `createClassicStory: no story found for request ${answers}`;
    logger.error(error);
    throw new Error(error);
  }

  const storyId = pickRandom(storyIds);
  const userStoriesManager = new FirebaseUserStoriesManager(
    firestore.userStories
  );
  await userStoriesManager.addCacheStory(uid, storyId);

  // Update user stats
  const userStatsManager = new FirebaseUserStatsManager(firestore.userStats);
  await userStatsManager.updateStatsAfterStory(uid);

  return storyId;
});

/**
 * Initialize user stats in the user__stats collection from Firestore upon new user creation.
 */
export const initializeUserStats = region("europe-west6")
  .auth.user()
  .onCreate(async (user) => {
    const userStatsManager = new FirebaseUserStatsManager(firestore.userStats);

    const userStoriesLimit = parseEnvAsNumber("STORY_DAILY_LIMIT", 2);
    const initialUserStats = new UserStats(0, userStoriesLimit);

    await userStatsManager.initUser(user.uid, initialUserStats);
  });

/**
 * Resets the daily stories limit at a fixed schedule.
 */
export const resetDailyLimits = onSchedule("every day 01:00", async () => {
  logger.info("resetDailyLimits: started");
  const userStoriesLimit = parseEnvAsNumber("STORY_DAILY_LIMIT", 2);

  const userStatsManager = new FirebaseUserStatsManager(firestore.userStats);

  await userStatsManager.setAllRemainingStories(userStoriesLimit);
});

/**
 * Collect the user feedback and write it in the database.
 */
export const collectUserFeedback = onCall(async (request) => {
  const data = request.data;

  const text = data.text;
  const datetime = new Date(data.datetime);
  const uid = getUid(request.auth);

  const feedback = new UserFeedback(text, datetime, uid);

  const feedbackManager = new FirebaseUserFeedbackManager(
    firestore.userFeedback
  );

  await feedbackManager.write(feedback);
});

function getRateLimiter(limit: number): RateLimiter {
  return new BucketRateLimiter(
    new FirestoreBucketRateLimiterStorage(),
    new Map([["story", limit]]),
    new Map([["story", 24 * 3600]])
  );
}
