import { FirestoreUserFeedback } from "../../firebase/firestore_user_feedback";
import { logger } from "../../logger";
import { UserFeedback, UserFeedbackManager } from "./user_feedback";

/**
 * Collect user feedback
 */
export class FirebaseUserFeedbackManager implements UserFeedbackManager {
  constructor(readonly feedback: FirestoreUserFeedback) {}

  async write(feedback: UserFeedback) {
    const feedbackRef = this.feedback.newFeedbackRef();
    await feedbackRef.create(feedback.toJson());

    const feedbackId = feedbackRef.id;
    logger.info(
      `FirebaseUserFeedbackManager: feedback ${feedbackId} from user ${
        feedback.uid ?? "unknown"
      } was written to Firestore`
    );
    return feedbackId;
  }
}
