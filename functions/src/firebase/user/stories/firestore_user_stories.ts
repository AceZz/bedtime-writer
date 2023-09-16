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
 *<user_id>:
 *  cache/
 *    <storyId>
 *      createdAt: timestamp
 *      isFavorite: bool
 * ```
 */
export class FirestoreUserStories extends FirestoreCollection {
  userRef(id: string): DocumentReference {
    return this.storiesRef().doc(id);
  }

  storiesRef(): CollectionReference {
    return this.firestore.collection(this.collectionPath);
  }

  storiesDocRef(uid: string): DocumentReference {
    return this.firestore.collection(this.collectionPath).doc(uid);
  }

  cacheRef(id: string): CollectionReference {
    return this.userRef(id).collection("cache");
  }

  cacheDocRef(id: string, storyId: string): DocumentReference {
    return this.userRef(id).collection("cache").doc(storyId);
  }
}
