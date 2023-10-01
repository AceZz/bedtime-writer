import { FieldPath, Firestore } from "firebase-admin/firestore";
import { FirestoreCollection } from "./firestore_collection";

/**
 * An object with fields.
 */
export type FirestoreDocument = { [key: string]: any };

/**
 * Dump `rawObjects` to `collection`.
 *
 * The exact keys of `rawObjects` are used as the IDs of the inserted Firestore
 * documents. If a Firestore document already exists, it is as if it was removed
 * and replaced.
 *
 * If one of the objects in `rawObjects` has a value which is a `Map`, its
 * content is inserted as a subcollection of the Firestore document.
 */
export async function dumpToCollection(
  collection: FirestoreCollection,
  rawObjects: Map<string, FirestoreDocument>
): Promise<void> {
  return dumpToCollectionInternal(
    collection.collectionPath,
    rawObjects,
    collection.firestore
  );
}

/**
 * Helper function that works with a string instead of a regular
 * `FirestoreCollection`. Especially useful for recursing over subcollections
 * (which are not necessarily `FirestoreCollection`s).
 */
async function dumpToCollectionInternal(
  path: string,
  rawObjects: Map<string, FirestoreDocument>,
  firestore: Firestore
): Promise<void> {
  const collection = firestore.collection(path);

  for (const [id, raw] of rawObjects) {
    const document = collection.doc(id);
    // Not required, but may fix a problem on some environments.
    await document.set({});

    const data: FirestoreDocument = {};
    for (const key in raw) {
      // If the value is a `Map`, insert it in a subcollection.
      // Otherwise, store the value in `data`, it will be inserted in the end.
      if (raw[key] instanceof Map) {
        const subCollection = document.collection(key).path;
        await dumpToCollectionInternal(subCollection, raw[key], firestore);
      } else {
        data[key] = raw[key];
      }
    }
    await document.set(data);
  }
}

/**
 * Return the content of `collection` as a `Map` indexing objects by their IDs.
 * Nested collections are themselves dumped as `Map`.
 *
 * If `ids` is provided, only dump those.
 */
export async function dumpCollection(
  collection: FirestoreCollection,
  ids?: string[]
): Promise<Map<string, object>> {
  return dumpCollectionInternal(
    collection.collectionPath,
    collection.firestore,
    ids
  );
}

/**
 * Helper function that works with a string instead of a regular
 * `FirestoreCollection`. Especially useful for recursing over subcollections
 * (which are not necessarily `FirestoreCollection`s).
 *
 * If `ids` is provided, only dump those.
 */
async function dumpCollectionInternal(
  path: string,
  firestore: Firestore,
  ids?: string[]
): Promise<Map<string, object>> {
  const result = new Map<string, object>();

  const collection = firestore.collection(path);

  let snapshots;
  if (ids === undefined) {
    snapshots = await collection.get();
  } else {
    snapshots = await collection.where(FieldPath.documentId(), "in", ids).get();
  }

  for (const doc of snapshots.docs) {
    const id = doc.id;
    const data = doc.data();

    for (const subCollection of await doc.ref.listCollections()) {
      data[subCollection.id] = await dumpCollectionInternal(
        subCollection.path,
        firestore
      );
    }

    result.set(id, data);
  }

  return result;
}
