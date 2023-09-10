import { CollectionReference, Firestore } from "firebase-admin/firestore";

/**
 * Base class for Firestore helpers.
 */
export abstract class FirestoreCollection {
  constructor(
    readonly collectionPath: string,
    private readonly firestoreProvider: FirestoreProvider
  ) {}

  /**
   * Delete everything in the collection, including in subcollections.
   */
  async delete(): Promise<void> {
    return this.firestore.recursiveDelete(this.collection());
  }

  collection(): CollectionReference {
    return this.firestore.collection(this.collectionPath);
  }

  get firestore(): Firestore {
    return this.firestoreProvider.getFirestore();
  }
}

/**
 * A class that can provide a `Firestore` object.
 */
interface FirestoreProvider {
  getFirestore(): Firestore;
}
