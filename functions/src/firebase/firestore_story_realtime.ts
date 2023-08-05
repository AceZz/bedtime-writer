import { Firestore } from "firebase-admin/firestore";
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
export class FirestoreStoryRealtime extends FirestoreStories {
  constructor(readonly paths = new FirestorePaths(), firestore?: Firestore) {
    super(paths.story.realtime, firestore);
  }
}
