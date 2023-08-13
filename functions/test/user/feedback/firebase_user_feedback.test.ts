import { afterEach, beforeAll, describe, expect, test } from "@jest/globals";
import {
  FirestorePaths,
  FirestoreUserFeedback,
  initEnv,
  initFirebase,
} from "../../../src/firebase";
import {
  FirebaseUserFeedbackManager,
  UserFeedback,
} from "../../../src/user/feedback"; // Import the UserFeedback type

describe("FirebaseUserFeedbackManager", () => {
  let feedbackCollection: FirestoreUserFeedback;
  let feedbackId: string;

  beforeAll(() => {
    initEnv();
    initFirebase(true);
    feedbackCollection = new FirestorePaths("test_user_feedback").userFeedback;
  });

  afterEach(async () => {
    await feedbackCollection.feedbackRef(feedbackId).delete();
  });

  test("should write user feedback to Firestore", async () => {
    const userFeedbackJson = {
      text: "test-feedback",
      datetime: new Date(),
      uid: "test-user",
    };
    const userFeedback = new UserFeedback(
      userFeedbackJson.text,
      userFeedbackJson.datetime,
      userFeedbackJson.uid
    );

    const feedbackManager = new FirebaseUserFeedbackManager(feedbackCollection);
    feedbackId = await feedbackManager.write(userFeedback);

    const actualFeedback = await feedbackCollection
      .feedbackRef(feedbackId)
      .get();
    // Need to process the datetime format for comparison
    const actualFeedbackJson = actualFeedback.data();
    if (actualFeedbackJson != undefined) {
      actualFeedbackJson.datetime = actualFeedbackJson?.datetime.toDate();
    }
    expect(actualFeedbackJson).toEqual(userFeedbackJson);
  });
});
