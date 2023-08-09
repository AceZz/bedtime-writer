import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "@jest/globals";
import { FirestorePaths, initEnv, initFirebase } from "../../../src/firebase";
import { FirestoreUserFeedback } from "../../../src/firebase/firestore_user_feedback";
import {
  FirebaseUserFeedbackManager,
  UserFeedback,
} from "../../../src/user/feedback"; // Import the UserFeedback type

describe("FirebaseUserFeedbackManager", () => {
  const paths = new FirestorePaths("test");
  let feedbackId: string;
  let feedbackCollection: FirestoreUserFeedback;

  beforeAll(() => {
    initEnv();
    initFirebase(true);
  });

  beforeEach(async () => {
    feedbackCollection = new FirestoreUserFeedback(paths);
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
