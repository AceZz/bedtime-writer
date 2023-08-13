import {
  CollectionReference,
  DocumentReference,
  Firestore,
} from "firebase-admin/firestore";

/**
 * Helper class to manipulate a stories collection. It follows this schema:
 *
 * ```plain
 * <story_id>:
 *   ...
 *   request: JSON
 *
 *   images/
 *   parts/
 *   prompts/
 */
export abstract class FirestoreStories {
  constructor(
    readonly collectionPath: string,
    private readonly firestore: Firestore
  ) {}

  storyRef(id: string): DocumentReference {
    return this.storiesRef().doc(id);
  }

  storiesRef(): CollectionReference {
    return this.firestore.collection(this.collectionPath);
  }

  imagesRef(id: string): CollectionReference {
    return this.storyRef(id).collection("images");
  }

  partsRef(id: string): CollectionReference {
    return this.storyRef(id).collection("parts");
  }

  promptsRef(id: string): CollectionReference {
    return this.storyRef(id).collection("prompts");
  }

  /**
   * Copy a story to another FirestoreStories collection.
   *
   * The copy includes the story doc and its subcollections. It will
   * fail in case the destination already has a story with the same id.
   */
  async copyStory(id: string, destination: FirestoreStories): Promise<void> {
    const sourceStoryRef = this.storyRef(id);
    // Fetch the story data
    const storyData = (await sourceStoryRef.get()).data();
    if (!storyData) {
      throw new Error(`copyStory: story with id ${id} not found.`);
    }

    // Create or update the story in the destination collection
    const destinationStoryRef = destination.storyRef(id);
    await destinationStoryRef.create(storyData);

    // Function to copy a subcollection
    const copySubcollection = async (
      sourceRef: CollectionReference,
      destinationRef: CollectionReference
    ) => {
      const snapshot = await sourceRef.get();
      const batch = destination.firestore.batch();
      snapshot.docs.forEach((doc) => {
        const destDocRef = destinationRef.doc(doc.id);
        batch.set(destDocRef, doc.data());
      });
      return batch.commit();
    };

    // Copy subcollections
    await copySubcollection(this.imagesRef(id), destination.imagesRef(id));
    await copySubcollection(this.partsRef(id), destination.partsRef(id));
    await copySubcollection(this.promptsRef(id), destination.promptsRef(id));
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
