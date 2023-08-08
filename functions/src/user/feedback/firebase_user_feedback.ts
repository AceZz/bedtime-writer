import { FirestoreUserFeedback } from "../../firebase/firestore_user_feedback";
import { logger } from "../../logger";
import { UserFeedback, UserFeedbackManager } from "./user_feedback";

/**
 * Update stories stats
 */
export class FirebaseUserFeedbackManager implements UserFeedbackManager {
  constructor(readonly feedback: FirestoreUserFeedback) {}

  //TODO: write tests
  async write(feedback: UserFeedback) {
    const feedbackRef = this.feedback.newFeedbackRef();
    await feedbackRef.create(feedback.toJson());
    logger.info(
      `FirebaseUserFeedbackManager: feedback ${feedbackRef.id} from user ${
        feedback.uid ?? "unknown"
      } was written to Firestore`
    );
  }
}
