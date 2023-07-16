import {
  CollectionReference,
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
export class FirestoreStoryCache {
  private firestore: Firestore;
  readonly name: string;

  constructor(readonly paths = new FirestorePaths(), firestore?: Firestore) {
    this.firestore = firestore ?? getFirestore();
    this.name = this.paths.story.cache;
  }

  storyCacheRef(): CollectionReference {
    return this.firestore.collection(this.name);
  }
}
