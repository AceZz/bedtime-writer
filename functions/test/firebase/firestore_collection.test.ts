import { beforeAll, describe, expect, test } from "@jest/globals";
import { initEnv, initFirebase } from "../../src/firebase";
import { FirestoreCollection } from "../../src/firebase/firestore_collection";
import { getFirestore } from "firebase-admin/firestore";

class DummyFirestoreCollection extends FirestoreCollection {
  constructor() {
    super("test_firestore_collection", {
      getFirestore: getFirestore,
    });
  }
}
const collection = new DummyFirestoreCollection();

describe("FirestoreCollection", () => {
  beforeAll(() => {
    initEnv();
    initFirebase(true);
  });

  test("delete() simple", async () => {
    await collection.collection().add({ dummy: true });
    await collection.delete();

    const actualCount = (await collection.collection().count().get()).data()
      .count;
    expect(actualCount).toBe(0);
  });

  test("delete() nested", async () => {
    const doc = await collection.collection().add({ dummy: true });
    await doc.collection("dummy").add({ dummy: true });
    await collection.delete();

    const collectionCount = (await collection.collection().count().get()).data()
      .count;
    expect(collectionCount).toBe(0);

    const subCollectionCount = (
      await doc.collection("dummy").count().get()
    ).data().count;
    expect(subCollectionCount).toBe(0);
  });

  test("collection()", () => {
    expect(collection.collection().path).toBe("test_firestore_collection");
  });
});
