import process from "node:process";

import { Firestore, Timestamp } from "firebase-admin/firestore";

/**
 * Define a requestLimiter which limits the number of requests:
 * - per user uid
 * - globally
 */
export const requestLimiter = async (
  firestore: Firestore,
  uid: string
): Promise<void> => {
  const limitPeriodDays = Number(process.env.LIMIT_PERIOD_DAYS);
  const requestUserLimit = Number(process.env.REQUEST_USER_LIMIT);
  const requestGlobalLimit = Number(process.env.REQUEST_GLOBAL_LIMIT);

  console.log(requestGlobalLimit);

  // Ensure env variables are defined
  if (isNaN(limitPeriodDays)) {
    throw new Error("The environment variable LIMIT_PERIOD_DAYS is not set!");
  }
  if (isNaN(requestUserLimit)) {
    throw new Error("The environment variable REQUEST_USER_LIMIT is not set!");
  }
  if (isNaN(requestGlobalLimit)) {
    throw new Error(
      "The environment variable REQUEST_GLOBAL_LIMIT is not set!"
    );
  }

  const now = Timestamp.now();
  const requestBackendLimitPeriodMillis = limitPeriodDays * 24 * 60 * 60 * 1000;
  const pastTime = Timestamp.fromMillis(
    now.toMillis() - requestBackendLimitPeriodMillis
  );

  // Add the new request to the Firestore collection.
  const docRef = firestore.collection("requests").doc();
  await docRef.set({
    uid: uid,
    timestamp: now,
  });

  // Get all the requests for this user within the timeframe.
  const snapshot_user = await firestore
    .collection("requests")
    .where("uid", "==", uid)
    .where("timestamp", ">=", pastTime)
    .get();

  // Get all requests overall within the timeframe.
  const snapshot_global = await firestore
    .collection("requests")
    .where("timestamp", ">=", pastTime)
    .get();

  // Check against the request limit.
  if (snapshot_user.size > requestUserLimit) {
    throw new Error(
      `User ${uid} has exceeded the request limit of ${requestUserLimit} requests in the last ${
        limitPeriodDays * 24
      } hours.`
    );
  } else if (snapshot_global.size > requestGlobalLimit) {
    throw new Error(
      `Global requests have exceeded the request limit of ${requestGlobalLimit} requests in the last ${
        limitPeriodDays * 24
      } hours.`
    );
  }
};
