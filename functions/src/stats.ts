import { firestore } from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";
import { logger } from "./logger";

//TODO: add numStories update here, possibly batch

/**
 * Update stories stats
 *
 * Throw an HttpsError in case there are no remaining stories for today.
 */
export async function updateUserStats(
  uid: string,
  firestore_db: firestore.Firestore
) {
  // Retrieve user document.
  const userRef = firestore_db.collection("users").doc(uid);
  const userSnapshot = await userRef.get();
  const userSnapshotData = userSnapshot.data();

  // If no user data is found, throw an error.
  let userData;
  if (!userSnapshotData) {
    logger.error(`User ${uid} was not found in the collection users.`);
    throw new HttpsError(
      "not-found",
      "User was not found in the collection users."
    );
  } else {
    userData = userSnapshotData;
  }

  // Check remaining stories and throw an error if there are none.
  if (userData.remainingStories <= 0) {
    logger.error(
      `User ${uid} sent a new story request despite having no more remaining stories today. It should not be possible.`
    );
    throw new HttpsError(
      "resource-exhausted",
      "Story requests for this user have reached their limit for today."
    );
  }

  // Decrease remaining stories and increase total created stories.
  await userRef.update({
    remainingStories: FieldValue.increment(-1),
    numStories: FieldValue.increment(1),
  });
}
