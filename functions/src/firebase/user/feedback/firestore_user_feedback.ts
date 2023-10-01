import {
  CollectionReference,
  DocumentReference,
} from "firebase-admin/firestore";
import { FirestoreCollection } from "../../firestore_collection";

/**
 * Helper class to manipulate the user feedback collection (usually called
 * `user__feedback`. It follows this schema:
 *
 * ```plain
 * <feedback_id>:
 *   text: string
 *   createdAt: timestamp
 *   uid: string
 * ```
 */
export class FirestoreUserFeedback extends FirestoreCollection {
  newFeedbackRef(): DocumentReference {
    return this.feedbacksRef().doc();
  }

  feedbackRef(id: string): DocumentReference {
    return this.feedbacksRef().doc(id);
  }

  feedbacksRef(): CollectionReference {
    return this.firestore.collection(this.collectionPath);
  }
}
