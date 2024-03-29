import { expect } from "@jest/globals";
import { FirestoreUserFeedback } from "../../../src/firebase";

/**
 * Helper class to interact with the user feedback Firestore collection.
 */
export class FirestoreUserFeedbackUtils extends FirestoreUserFeedback {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async expectToStrictEqual(expected: any[]): Promise<void> {
    const snapshots = await this.feedbacksRef().orderBy("createdAt").get();

    const tested = snapshots.docs.map((snapshot) => snapshot.data());
    const tested_ = tested.map((item) => ({
      ...item,
      createdAt: item.createdAt.toDate(),
    }));

    const expected_ = expected.map((item) => ({ ...item }));
    expected_.sort((a, b) => a.createdAt - b.createdAt);

    expect(tested_).toStrictEqual(expected_);
  }
}
