/**
 * Interface to write stories to some output.
 */
export interface UserStatsManager {
  getUserStats(uid: string): Promise<UserStats | undefined>;
  initializeUserStats(uid: string, userStats: UserStats): Promise<void>;
  resetAllRemainingStories(remainingStories: number): Promise<void>;
  updateUserStats(uid: string, data: Partial<UserStats>): Promise<void>;
}

export class UserStats {
  numStories: number;
  remainingStories: number;

  constructor(numStories: number, remainingStories: number) {
    this.numStories = numStories;
    this.remainingStories = remainingStories;
  }
}
