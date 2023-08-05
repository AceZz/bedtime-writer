import {
  CollectionReference,
  DocumentReference,
  Firestore,
  getFirestore,
} from "firebase-admin/firestore";
import { FirestorePaths } from "./firestore_paths";
import { FirestoreStories } from "./firestore_stories";

/**
 * Helper class to manipulate the story realtime collection. It follows this
 * schema:
 *
 * ```plain
 * story__realtime:
 *     <story_1>:
 *        ...
 *        request {}
 *     <story_2>:
 *        ...
 *     ...
 *   ...
 * ```
 */
export class FirestoreStoryRealtime implements FirestoreStories {
  private firestore: Firestore;

  constructor(readonly paths = new FirestorePaths(), firestore?: Firestore) {
    this.firestore = firestore ?? getFirestore();
  }

  storyRef(docId: string): DocumentReference {
    return this.storiesRef().doc(docId);
  }

  storiesRef(): CollectionReference {
    return this.firestore.collection(this.paths.story.realtime);
  }
}
