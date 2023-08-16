import { expect } from "@jest/globals";
import { FirestoreUserFeedback } from "../../../src/firebase";

/**
 * Helper class to interact with the user feedback Firestore collection.
 */
export class FirestoreUserFeedbackUtils extends FirestoreUserFeedback {
  /**
   * Delete the collection.
   *
   * Firebase must be initialized before calling this function.
   */
  async delete(): Promise<void> {
    const feedbacks = await this.feedbacksRef().get();
    await Promise.all(feedbacks.docs.map((feedback) => feedback.ref.delete()));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async expectToStrictEqual(expected: any[]): Promise<void> {
    const snapshots = await this.feedbacksRef().orderBy("datetime").get();

    const tested = snapshots.docs.map((snapshot) => snapshot.data());
    const tested_ = tested.map((item) => ({
      ...item,
      datetime: item.datetime.toDate(),
    }));

    const expected_ = expected.map((item) => ({ ...item }));
    expected_.sort((a, b) => a.datetime - b.datetime);

    expect(tested_).toStrictEqual(expected_);
  }
}
