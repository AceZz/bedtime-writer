import { Timestamp } from "firebase-admin/firestore";
import { FirestoreStoryForms } from "../../../src/firebase";
import { expect } from "@jest/globals";

/**
 * Helper class to interact with the story forms Firestore collection.
 */
export class FirestoreStoryFormsUtils extends FirestoreStoryForms {
  /**
   * Delete the collection.
   *
   * Firebase must be initialized before calling this function.
   */
  async delete(): Promise<void> {
    const forms = await this.formsRef().get();
    await Promise.all(forms.docs.map((form) => form.ref.delete()));
  }
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
    const snapshots = await this.formsRef().orderBy("datetime").get();

    const tested = snapshots.docs.map((snapshot) => snapshot.data());
    const expected_ = expected.map((item) => {
      return {
        ...item,
        datetime: new Timestamp(item.datetime.getTime() / 1000, 0),
      };
    });
    expected_.sort((a, b) => a.datetime - b.datetime);

    expect(tested).toStrictEqual(expected_);
  }

  async expectIsGenerated(id: string): Promise<void> {
    const data = (await this.formRef(id).get()).data();
    expect(data?.isGenerated).toBe(true);
  }
}
