import { beforeAll, beforeEach, describe, test } from "@jest/globals";
import { initEnv, initFirebase } from "../../../src/firebase";
import { FirestoreContextUtils } from "../../firebase/utils";
import { FirebaseUserFeedbackManager } from "../../../src/user"; // Import the UserFeedback type
import { FEEDBACK_0 } from "../data";

const utils = new FirestoreContextUtils("user_feedback");
const userFeedback = utils.userFeedback;

describe("FirebaseUserFeedbackManager", () => {
  let feedbackManager: FirebaseUserFeedbackManager;

  beforeAll(() => {
    initEnv();
    initFirebase(true);
    feedbackManager = new FirebaseUserFeedbackManager(userFeedback);
  });

  // Empty the feedback collection.
  beforeEach(async () => {
    await userFeedback.delete();
  });

  test("should write user feedback to Firestore", async () => {
    await feedbackManager.write(FEEDBACK_0);
    await userFeedback.expectToStrictEqual([FEEDBACK_0]);
  });
});
