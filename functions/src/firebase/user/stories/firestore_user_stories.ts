import {
  CollectionReference,
  DocumentReference,
} from "firebase-admin/firestore";
import { FirestoreCollection } from "../../firestore_collection";

/**
 * Helper class to manipulate the user stories collection (usually called
 * `user__stories`). It follows this schema:
 *
 * ```plain
 * <user_id>:
 *   cache/
 *     <storyId>:
 *       createdAt: timestamp
 *       isFavorite: bool
 * ```
 */
export class FirestoreUserStories extends FirestoreCollection {
  userRef(uid: string): DocumentReference {
    return this.storiesRef().doc(uid);
  }

  storiesRef(): CollectionReference {
    return this.firestore.collection(this.collectionPath);
  }

  storiesDocRef(uid: string): DocumentReference {
    return this.firestore.collection(this.collectionPath).doc(uid);
  }

  cacheRef(uid: string): CollectionReference {
    return this.userRef(uid).collection("cache");
  }

  cacheDocRef(uid: string, storyId: string): DocumentReference {
    return this.cacheRef(uid).doc(storyId);
  }
}
