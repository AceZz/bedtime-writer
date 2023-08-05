import {
  CollectionReference,
  DocumentReference,
  Firestore,
  getFirestore,
} from "firebase-admin/firestore";
import { FirestorePaths } from "./firestore_paths";
import { FirestoreStories } from "./firestore_stories";

/**
 * Helper class to manipulate the story cache collection. It follows this
 * schema:
 *
 * ```plain
 * story__cache:
 *     <story_1>:
 *        ...
 *        request {}
 *     <story_2>:
 *        ...
 *     ...
 *   ...
 * ```
 */
export class FirestoreStoryCache implements FirestoreStories {
  private firestore: Firestore;

  constructor(readonly paths = new FirestorePaths(), firestore?: Firestore) {
    this.firestore = firestore ?? getFirestore();
  }

  storyRef(storyId: string): DocumentReference {
    return this.storiesRef().doc(storyId);
  }

  storiesRef(): CollectionReference {
    return this.firestore.collection(this.paths.story.cache);
  }

  storyRequestRef(storyId: string, requestVersion: string): DocumentReference {
    return this.storyRef(storyId).collection("request").doc(requestVersion);
  }
}
