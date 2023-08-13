import {
  CollectionReference,
  DocumentReference,
  Firestore,
} from "firebase-admin/firestore";

/**
 * Helper class to manipulate the user stats collection (usually called
 * `user__stats`. It follows this schema:
 *
 * ```plain
 *<user_id>:
 *  remainingStories: int
 *  numStories: int
 * ```
 */
export class FirestoreUserStats {
  constructor(
    readonly collectionPath: string,
    private readonly firestore: Firestore
  ) {}

  userRef(id: string): DocumentReference {
    return this.statsRef().doc(id);
  }

  statsRef(): CollectionReference {
    return this.firestore.collection(this.collectionPath);
  }
}
