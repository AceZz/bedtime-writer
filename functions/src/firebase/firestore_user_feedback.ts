import {
  CollectionReference,
  DocumentReference,
  Firestore,
} from "firebase-admin/firestore";

/**
 * Helper class to manipulate the user feedback collection (usually called
 * `user__feedback`. It follows this schema:
 *
 * ```plain
 *<feedback_id>:
 *   text: string
 *   datetime: datetime
 *   uid: string
 * ```
 */
export class FirestoreUserFeedback {
  constructor(
    readonly collectionPath: string,
    private readonly firestore: Firestore
  ) {}

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
