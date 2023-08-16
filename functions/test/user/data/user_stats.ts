import { HttpsError } from "firebase-functions/v2/https";

import { UserStats } from "../../../src/user";

/**
 * Dummy uids.
 */
export const UID_0 = "uid-0";
export const UID_1 = "uid-1";

/**
 * Dummy stats.
 */
export const STATS_0 = new UserStats(0, 2);
export const STATS_1 = new UserStats(2, 0);

export const STATS_UPDATED_0 = new UserStats(1, 1);

/**
 * Dummy remaining stories number.
 */
export const REMAINING_STORIES = 42;

/**
 * Errors expected to be thrown.
 */
export const ERROR_LIMIT = new HttpsError(
  "resource-exhausted",
  "Story requests for this user have reached their limit for today."
);
export const ERROR_NOT_FOUND = new HttpsError("not-found", "User not found.");
