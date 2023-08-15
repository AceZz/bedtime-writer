import { Timestamp, getFirestore } from "firebase-admin/firestore";
import { FirestoreStoryForms } from "../../../src/firebase";
import { expect } from "@jest/globals";

/**
 * Helper class to interact with the story forms Firestore collection.
 */
export class FirestoreFormsTestUtils extends FirestoreStoryForms {
  /**
   * Delete the collection.
   *
   * Firebase must be initialized before calling this function.
   */
  async delete(): Promise<void> {
    const firestore = getFirestore();
    const forms = await firestore.collection(this.collectionPath).get();
    await Promise.all(forms.docs.map((form) => form.ref.delete()));
  }
  /**
   * Checks the number of forms in the Firestore database.
   *
   * Firebase must be initialized before calling this function.
   */
  async expectCountToBe(expected: number): Promise<void> {
    const firestore = getFirestore();
    const forms = firestore.collection(this.collectionPath);
    const query = await forms.count().get();

    expect(query.data().count).toBe(expected);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async expectToBe(expected: any[]): Promise<void> {
    const firestore = getFirestore();
    const forms = firestore.collection(this.collectionPath);
    const snapshots = await forms.orderBy("start").get();

    const tested = snapshots.docs.map((snapshot) => snapshot.data());
    const expected_ = expected.map((item) => {
      return {
        ...item,
        start: new Timestamp(item.start.getTime() / 1000, 0),
      };
    });
    expected_.sort((a, b) => a.start - b.start);

    expect(tested).toStrictEqual(expected_);
  }
}
