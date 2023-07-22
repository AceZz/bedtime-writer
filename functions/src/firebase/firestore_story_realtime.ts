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
 *        request:
 *           <version>:
 *              formId: string
 *              <question>: <choice>
 *              ...
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

  storiesRef(): CollectionReference {
    return this.firestore.collection(this.paths.story.realtime);
  }
  newStoryRef(): DocumentReference {
    return this.storiesRef().doc();
  }
  storyRef(docId: string): DocumentReference {
    return this.storiesRef().doc(docId);
  }
}
