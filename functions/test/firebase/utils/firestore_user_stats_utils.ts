import { expect } from "@jest/globals";
import { FirestoreUserStats } from "../../../src/firebase";
import { UserStats } from "../../../src/user";

/**
 * Helper class to interact with the user stats Firestore collection.
 */
export class FirestoreUserStatsUtils extends FirestoreUserStats {
  /**
   * Delete the collection.
   *
   * Firebase must be initialized before calling this function.
   */
  async delete(): Promise<void> {
    const stats = await this.statsRef().get();
    await Promise.all(stats.docs.map((stats_) => stats_.ref.delete()));
  }

  async create(id: string, stats: UserStats): Promise<void> {
    await this.userRef(id).create({ ...stats });
  }

  async expectToEqual(expected: UserStats[]): Promise<void> {
    const snapshots = await this.statsRef().get();

    const tested = snapshots.docs.map((snapshot) => snapshot.data());
    const tested_ = tested
      .map((item) => ({
        numStories: item.numStories,
        remainingStories: item.remainingStories,
      }))
      .sort();

    const expected_ = expected.map((item) => ({ ...item })).sort();

    expect(tested_).toStrictEqual(expected_);
  }

  async expectAllRemainingToBe(expected: number): Promise<void> {
    const snapshots = await this.statsRef().get();

    const tested = snapshots.docs.map(
      (snapshot) => snapshot.data().remainingStories
    );

    tested.forEach((n) => {
      expect(n).toBe(expected);
    });
  }
}
