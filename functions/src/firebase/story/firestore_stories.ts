import {
  CollectionReference,
  DocumentReference,
} from "firebase-admin/firestore";
import { FirestoreCollection } from "../firestore_collection";

/**
 * Helper class to manipulate a stories collection. It follows this schema:
 *
 * ```plain
 * <storyId>:
 *   isFavorite: bool (optional)
 *   logic: JSON
 *   partIds: <partId>[]
 *   request: JSON
 *   status: string
 *   createdAt: timestamp
 *   title: string
 *   user: <userId>
 *
 *   images/
 *     <imageId>:
 *       data: bytes
 *   parts/
 *     <partId>:
 *       text: string
 *       image: <imageId>
 *   prompts/
 *     <partId>:
 *       textPrompt: string
 *       imagePrompt: string
 *       imagePromptPrompt: string
 */
export abstract class FirestoreStories extends FirestoreCollection {
  storyRef(id: string): DocumentReference {
    return this.storiesRef().doc(id);
  }

  storiesRef(): CollectionReference {
    return this.firestore.collection(this.collectionPath);
  }

  imageRef(storyId: string, id: string): DocumentReference {
    return this.imagesRef(storyId).doc(id);
  }

  imagesRef(id: string): CollectionReference {
    return this.storyRef(id).collection("images");
  }

  partRef(storyId: string, id: string): DocumentReference {
    return this.partsRef(storyId).doc(id);
  }

  partsRef(id: string): CollectionReference {
    return this.storyRef(id).collection("parts");
  }

  promptsDocRef(storyId: string, id: string): DocumentReference {
    return this.promptsRef(storyId).doc(id);
  }

  promptsRef(id: string): CollectionReference {
    return this.storyRef(id).collection("prompts");
  }
}

/**
 * Helper class to manipulate the story cache collection (usually called
 * `story__cache`).
 */
export class FirestoreStoryCache extends FirestoreStories {}

/**
 * Helper class to manipulate the story realtime collection (usually called
 * `story__realtime`).
 */
export class FirestoreStoryRealtime extends FirestoreStories {}
