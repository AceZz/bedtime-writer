import { beforeAll, expect, test } from "@jest/globals";
import { getFirestore } from "firebase-admin/firestore";
import { FirestorePaths, initEnv, initFirebase } from "../src/firebase";

beforeAll(() => {
  initEnv();
  // Check we are running in emulator mode before initializing Firebase.
  initFirebase(true);
});

test("Can connect to Firebase", () => {
  // We actually test the content of `beforeAll()`.
  expect(1).toBe(1);
});

test("Can connect to Firestore", async () => {
  const firestore = getFirestore();
  const paths = new FirestorePaths("test");
  const query = await firestore
    .collection(paths.storyRealtime.collectionPath)
    .count()
    .get();
  expect(query.data().count).toBeGreaterThanOrEqual(0);
});
