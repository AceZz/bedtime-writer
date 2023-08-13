import {
  CollectionReference,
  DocumentReference,
} from "firebase-admin/firestore";
import { FirestoreCollection } from "./firestore_collection";

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
export class FirestoreUserStats extends FirestoreCollection {
  userRef(id: string): DocumentReference {
    return this.statsRef().doc(id);
  }

  statsRef(): CollectionReference {
    return this.firestore.collection(this.collectionPath);
  }
}
