import {
  CollectionReference,
  DocumentReference,
  Firestore,
  getFirestore,
} from "firebase-admin/firestore";
import { FirestorePaths } from "./firestore_paths";

/**
 * Helper class to manipulate the user feedback collection. It follows this
 * schema:
 *
 * ```plain
 * user_feedback:
 *     <feedback_1>:
 *        text:
 *        datetime:
 *        uid:
 *     <feedback_2>:
 *        ...
 *     ...
 *   ...
 * ```
 */
export class FirestoreUserFeedback {
  private firestore: Firestore;

  constructor(readonly paths = new FirestorePaths(), firestore?: Firestore) {
    this.firestore = firestore ?? getFirestore();
  }

  newFeedbackRef(): DocumentReference {
    return this.feedbacksRef().doc();
  }

  feedbackRef(id: string): DocumentReference {
    return this.feedbacksRef().doc(id);
  }

  feedbacksRef(): CollectionReference {
    return this.firestore.collection(this.paths.user.feedback);
  }
}
