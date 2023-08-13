import {
  CollectionReference,
  DocumentReference,
  Firestore,
  getFirestore,
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
  private readonly firestore: Firestore;

  constructor(readonly collectionPath: string, firestore?: Firestore) {
    this.firestore = firestore ?? getFirestore();
  }

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
