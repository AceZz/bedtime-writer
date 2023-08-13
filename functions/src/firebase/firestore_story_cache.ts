import { Firestore } from "firebase-admin/firestore";
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
export class FirestoreStoryCache extends FirestoreStories {
  constructor(readonly paths = new FirestorePaths(), firestore?: Firestore) {
    super(paths.story.cache, firestore);
  }
}
