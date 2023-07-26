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
export class FirestoreStoryCache implements FirestoreStories {
  private firestore: Firestore;

  constructor(readonly paths = new FirestorePaths(), firestore?: Firestore) {
    this.firestore = firestore ?? getFirestore();
  }

  storyRequestRef(storyDocId: string): DocumentReference {
    return this.storyRef(storyDocId).collection("request").doc("v1");
  }
  storiesRef(): CollectionReference {
    return this.firestore.collection(this.paths.story.cache);
  }
  newStoryRef(): DocumentReference {
    return this.storiesRef().doc();
  }
  storyRef(storyDocId: string): DocumentReference {
    return this.storiesRef().doc(storyDocId);
  }
}
