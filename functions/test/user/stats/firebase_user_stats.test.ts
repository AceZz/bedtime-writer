import { beforeAll, beforeEach, describe, expect, test } from "@jest/globals";
import { initEnv, initFirebase } from "../../../src/firebase";
import { FirestoreContextUtils } from "../../firebase/utils";
import { FirebaseUserStatsManager } from "../../../src/user";
import {
  UID_0,
  UID_1,
  STATS_0,
  STATS_1,
  REMAINING_STORIES,
  STATS_UPDATED_0,
  USER_STATS_ERROR_LIMIT,
  USER_STATS_ERROR_NOT_FOUND,
} from "../data";

const utils = new FirestoreContextUtils("user_stats");
const userStats = utils.userStats;

describe("FirebaseUserStatsManager", () => {
  const statsManager = new FirebaseUserStatsManager(userStats);

  beforeAll(() => {
    initEnv();
    initFirebase(true);
  });

  // Empty the feedback collection.
  beforeEach(async () => {
    await userStats.delete();
  });

  test("should get user stats", async () => {
    await userStats.create(UID_0, STATS_0);
    const actual = await statsManager.get(UID_0);
    expect({ ...actual }).toStrictEqual({ ...STATS_0 });
  });

  test("should init user stats", async () => {
    await statsManager.initUser(UID_0, STATS_0);
    await userStats.expectToStrictEqual([STATS_0]);
  });

  test("should set all remaining stories", async () => {
    await userStats.create(UID_0, STATS_0);
    await userStats.create(UID_1, STATS_1);
    await statsManager.setAllRemainingStories(REMAINING_STORIES);
    await userStats.expectAllRemainingToBe(REMAINING_STORIES);
  });

  test("should update stats after story", async () => {
    await userStats.create(UID_0, STATS_0);
    await statsManager.updateStatsAfterStory(UID_0);
    await userStats.expectToStrictEqual([STATS_UPDATED_0]);
  });

  test("should throw on updating stats after limit reached", async () => {
    await userStats.create(UID_1, STATS_1);
    await expect(statsManager.updateStatsAfterStory(UID_1)).rejects.toThrow(
      USER_STATS_ERROR_LIMIT
    );
  });

  test("should throw on user not found on update", async () => {
    await expect(statsManager.updateStatsAfterStory(UID_0)).rejects.toThrow(
      USER_STATS_ERROR_NOT_FOUND
    );
  });
});
