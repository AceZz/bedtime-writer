import { FieldValue } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";

import { UserStats, UserStatsManager } from "./user_stats";
import { logger } from "../../logger";
import { FirestoreUserStats } from "../../firebase";

/**
 * Update stories stats
 */
export class FirebaseUserStatsManager implements UserStatsManager {
  constructor(private readonly stats: FirestoreUserStats) {}

  async getUserStats(uid: string): Promise<UserStats | undefined> {
    const userRef = this.stats.userRef(uid);
    const userSnapshot = await userRef.get();
    const userData = userSnapshot.data();

    if (userData !== undefined && this.isUserStats(userData)) {
      return new UserStats(userData.numStories, userData.remainingStories);
    } else {
      return undefined;
    }
  }

  async setUserStats(uid: string, userStats: UserStats): Promise<void> {
    // Retrieve user document.
    const userRef = this.stats.userRef(uid);
    const userSnapshot = await userRef.get();
    const userSnapshotData = userSnapshot.data();

    // If no user data is found, add this user to the collection with maximal daily remaining stories.
    if (!userSnapshotData) {
      const userData = {
        numStories: userStats.numStories,
        remainingStories: userStats.remainingStories,
      };
      await userRef.set(userData);
    }
  }

  async setAllRemainingStories(remainingStories: number): Promise<void> {
    try {
      const usersSnapshot = await this.stats.statsRef().get();
      const numberUsers = usersSnapshot.size;

      const updates = usersSnapshot.docs.map((doc) => {
        const userRef = this.stats.userRef(doc.id);
        return userRef.update({
          remainingStories: remainingStories,
        });
      });

      await Promise.all(updates);

      logger.info(
        `resetDailyLimit: function executed successfully, updated ${numberUsers} user(s)`
      );
    } catch (error) {
      logger.error(`resetDailyLimit: error: ${error}`);
    }
  }

  async updateStatsAfterStory(uid: string): Promise<void> {
    // Retrieve user document.
    const userRef = this.stats.userRef(uid);
    const userSnapshot = await userRef.get();
    const userSnapshotData = userSnapshot.data();

    // If no user data is found, throw an error.
    if (!userSnapshotData) {
      logger.error(
        `updateStatsAfterStory: user ${uid} was not found in the collection user__stats.`
      );
      throw new HttpsError("not-found", "User not found.");
    }

    // Check remaining stories and throw an error if there are none.
    if (userSnapshotData.remainingStories <= 0) {
      logger.error(
        `updateStatsAfterStory: user ${uid} sent a new story request despite having no more remaining stories today. It should not be possible.`
      );
      throw new HttpsError(
        "resource-exhausted",
        "Story requests for this user have reached their limit for today."
      );
    }

    // Decrease remaining stories and increase total created stories.
    await userRef.update({
      remainingStories: FieldValue.increment(-1),
      numStories: FieldValue.increment(1),
    });
  }

  // Type guard for UserStats
  private isUserStats(
    userData: FirebaseFirestore.DocumentData
  ): boolean | undefined {
    return (
      typeof userData.numStories === "number" &&
      typeof userData.remainingStories === "number"
    );
  }
}
