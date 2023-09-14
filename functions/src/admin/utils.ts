import { firebaseEmulatorsAreUsed, getFirebaseProject } from "../firebase";
import { FirestoreCollection } from "../firebase/firestore_collection";

/**
 * Return a string giving the path and the origin (emulator or Firebase project)
 * of the collection.
 */
export function collectionInfo(collection: FirestoreCollection): string {
  if (firebaseEmulatorsAreUsed()) {
    return `${collection.collectionPath} (Firestore emulator)`;
  }

  return `${collection.collectionPath} (${getFirebaseProject()})`;
}
