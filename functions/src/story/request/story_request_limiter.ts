import process from "node:process";

import { Firestore, Timestamp } from "firebase-admin/firestore";

const limitPeriodDays = 1;

/**
 * Limit the number of requests per UID and globally. Throw an error if one of these limits is reached.
 */
export const storyRequestLimiter = async (
  firestore: Firestore,
  uid: string
): Promise<void> => {
  const requestUserLimit = Number(process.env.REQUEST_USER_LIMIT) ?? 5;
  const requestGlobalLimit = Number(process.env.REQUEST_GLOBAL_LIMIT) ?? 1000;

  const now = Timestamp.now();
  const requestBackendLimitPeriodMillis = limitPeriodDays * 24 * 60 * 60 * 1000;
  const pastTime = Timestamp.fromMillis(
    now.toMillis() - requestBackendLimitPeriodMillis
  );

  // Add the new request to the Firestore collection.
  const docRef = firestore.collection("story_requests").doc();
  await docRef.set({
    uid: uid,
    timestamp: now,
  });

  // Get all the requests for this user within the timeframe.
  const user_snapshot = await firestore
    .collection("story_requests")
    .where("uid", "==", uid)
    .where("timestamp", ">=", pastTime)
    .count()
    .get();

  // Get all requests overall within the timeframe.
  const global_snapshot = await firestore
    .collection("story_requests")
    .where("timestamp", ">=", pastTime)
    .count()
    .get();

  // Check against the request limit.
  if (user_snapshot.data().count > requestUserLimit) {
    throw new Error(
      `User ${uid} has exceeded the request limit of ${requestUserLimit} requests in the last ${
        limitPeriodDays * 24
      } hours.`
    );
  } else if (global_snapshot.data().count > requestGlobalLimit) {
    throw new Error(
      `Global requests have exceeded the request limit of ${requestGlobalLimit} requests in the last ${
        limitPeriodDays * 24
      } hours.`
    );
  }
};
