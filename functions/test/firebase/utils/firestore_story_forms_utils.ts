import { Timestamp } from "firebase-admin/firestore";
import { FirestoreStoryForms } from "../../../src/firebase";
import { expect } from "@jest/globals";

/**
 * Helper class to interact with the story forms Firestore collection.
 */
export class FirestoreStoryFormsUtils extends FirestoreStoryForms {
  /**
   * Checks the number of forms in the Firestore database.
   *
   * Firebase must be initialized before calling this function.
   */
  async expectCountToBe(expected: number): Promise<void> {
    const query = await this.formsRef().count().get();

    expect(query.data().count).toBe(expected);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async expectToBe(expected: any[]): Promise<void> {
    const snapshots = await this.formsRef().orderBy("createdAt").get();

    const tested = snapshots.docs.map((snapshot) => snapshot.data());
    const expected_ = expected.map((item) => {
      return {
        ...item,
        createdAt: new Timestamp(item.createdAt.getTime() / 1000, 0),
      };
    });
    expected_.sort((a, b) => a.createdAt - b.createdAt);

    expect(tested).toStrictEqual(expected_);
  }

  async expectIsCached(id: string): Promise<void> {
    const data = (await this.formRef(id).get()).data();
    expect(data?.isCached).toBe(true);
  }

  async expectIsApproved(id: string): Promise<void> {
    const data = (await this.formRef(id).get()).data();
    expect(data?.isApproved).toBe(true);
  }
}
