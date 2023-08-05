import {
  CollectionReference,
  DocumentReference,
  Firestore,
  getFirestore,
} from "firebase-admin/firestore";

/**
 * A parent class with helpers for a collection which contains stories.
 */
export class FirestoreStories {
  private collection: string;
  readonly firestore: Firestore;

  constructor(collection: string, firestore?: Firestore) {
    this.collection = collection;
    this.firestore = firestore ?? getFirestore();
  }

  storyRef(id: string): DocumentReference {
    return this.storiesRef().doc(id);
  }

  storiesRef(): CollectionReference {
    return this.firestore.collection(this.collection);
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
}

/**
 * Copy a story from one FirestoreStories collection to another.
 *
 * The copy includes the story doc and its subcollections. It will
 * fail in case the destination already has a story with the same id.
 */
export async function copyStory(
  source: FirestoreStories,
  destination: FirestoreStories,
  id: string
): Promise<void> {
  const sourceStoryRef = source.storyRef(id);
  // Fetch the story data
  const storyData = (await sourceStoryRef.get()).data();
  if (!storyData) {
    throw new Error(`copyStory: story with id ${id} not found.`);
  }

  // Create or update the story in the destination collection
  const destinationStoryRef = destination.storyRef(id);
  await destinationStoryRef.set(storyData);

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
  await copySubcollection(source.imagesRef(id), destination.imagesRef(id));
  await copySubcollection(source.partsRef(id), destination.partsRef(id));
  await copySubcollection(source.promptsRef(id), destination.promptsRef(id));
}
