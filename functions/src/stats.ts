import { firestore } from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";
import { logger } from "./logger";

/**
 * Check if the user has reached their daily limit
 *
 * Throw an HttpsError in case there are no remaining stories for today.
 */
export async function updateRemainingStories(
  uid: string,
  firestore_db: firestore.Firestore
) {
  console.log(`THIS IS UID: ${uid}`);

  // Retrieve user document.
  const userRef = firestore_db.collection("users").doc(uid);
  const userSnapshot = await userRef.get();
  const userSnapshotData = userSnapshot.data();

  // If no user data is found, throw an error.
  let userData;
  if (!userSnapshotData) {
    throw new HttpsError("not-found", "User was not found in the database.");
  } else {
    userData = userSnapshotData;
  }

  // Check remaining stories and throw an error if there are none.
  if (userData.remainingStories <= 0) {
    logger.error(
      `User ${uid} tried to create a new story despite having no more remaining stories today.`
    );
    throw new HttpsError(
      "resource-exhausted",
      "Story requests for this user have reached their limit for today."
    );
  }

  // Decrease remaining stories.
  await userRef.update({
    remainingStories: FieldValue.increment(-1),
  });
}
