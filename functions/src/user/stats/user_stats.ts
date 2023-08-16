/**
 * Interface to manage user stats.
 */
export interface UserStatsManager {
  /**
   * Get the user stats from the Firestore collection.
   */
  get(uid: string): Promise<UserStats | undefined>;

  /**
   * Set the stats of the provided user to the provided values.
   */
  initUser(uid: string, userStats: UserStats): Promise<void>;

  /**
   * Set remaining stories of all users to the value provided.
   */
  setAllRemainingStories(remainingStories: number): Promise<void>;

  /**
   * Update the stats of the user by incrementing and decrementing relevant stats.
   *
   * Note: this will throw an error if called while the user's remaniningStories is 0.
   */
  updateStatsAfterStory(uid: string, data: Partial<UserStats>): Promise<void>;
}

export class UserStats {
  constructor(readonly numStories: number, readonly remainingStories: number) {}
}
