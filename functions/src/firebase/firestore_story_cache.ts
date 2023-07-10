import {
  CollectionReference,
  DocumentReference,
  Firestore,
  getFirestore,
} from "firebase-admin/firestore";
import { FirestorePaths } from "./firestore_paths";

/**
 * Helper class to manipulate the story cache collection. It follows this
 * schema:
 *
 * ```plain
 * story__cache:
 *   <cache_doc>:
 *     formId: timestamp
 *     stories:
 *       <story_1>:
 *          ...
 *       <story_2>:
 *          ...
 *       ...
 *     ...
 *   ...
 * ```
 */
export class FirestoreStoryCache {
  private firestore: Firestore;

  constructor(readonly paths = new FirestorePaths(), firestore?: Firestore) {
    this.firestore = firestore ?? getFirestore();
  }

  cacheRef(): CollectionReference {
    return this.firestore.collection(this.paths.story.cache);
  }

  cacheDocRef(docId: string): DocumentReference {
    return this.cacheRef().doc(docId);
  }

  storiesRef(cacheDocId: string): CollectionReference {
    return this.cacheDocRef(cacheDocId).collection(this.paths.story.stories);
  }
}
