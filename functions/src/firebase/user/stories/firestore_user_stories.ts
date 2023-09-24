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
    return this.usersRef().doc(uid);
  }

  usersRef(): CollectionReference {
    return this.firestore.collection(this.collectionPath);
  }

  userStoriesRef(uid: string): CollectionReference {
    return this.userRef(uid).collection("cache");
  }

  userStoryRef(uid: string, storyId: string): DocumentReference {
    return this.userStoriesRef(uid).doc(storyId);
  }
}
