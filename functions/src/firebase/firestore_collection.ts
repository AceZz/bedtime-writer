import { Firestore } from "firebase-admin/firestore";

/**
 * Base class for Firestore helpers.
 */
export abstract class FirestoreCollection {
  constructor(
    readonly collectionPath: string,
    private readonly firestoreProvider: FirestoreProvider
  ) {}

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
