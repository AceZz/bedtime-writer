import { beforeAll, beforeEach, describe, expect, test } from "@jest/globals";
import { initEnv, initFirebase } from "../../../src/firebase";
import { FirestoreContextUtils } from "../../firebase/utils";
import { FirebaseUserStoriesManager } from "../../../src/user";
import { CACHE_STORY_0, CACHE_STORY_1 } from "../data";

const utils = new FirestoreContextUtils("user_stories");
const userStories = utils.userStories;

describe("FirebaseUserStoriesManager", () => {
  const storiesManager = new FirebaseUserStoriesManager(userStories);

  beforeAll(() => {
    initEnv();
    initFirebase(true);
  });

  // Empty the stories collection.
  beforeEach(async () => {
    await userStories.delete();
  });

  test("should get cache story ids", async () => {
    await userStories.initDoc("uid0");
    await userStories.createCacheStory("uid0", "storyId0", CACHE_STORY_0);
    await userStories.createCacheStory("uid0", "storyId1", CACHE_STORY_1);
    const actual = await storiesManager.readCacheStoryIds("uid0");
    expect(actual.sort()).toEqual(["storyId0", "storyId1"]);
  });

  test("should add cache story", async () => {
    await storiesManager.addCacheStory("uid0", "storyId0");
    await userStories.expectCacheIdsToBe("uid0", ["storyId0"]);
  });

  test("should modify cache story create date", async () => {
    await userStories.initDoc("uid0");
    await userStories.createCacheStory("uid0", "storyId0", CACHE_STORY_0);
    await storiesManager.addCacheStory("uid0", "storyId0");
    await userStories.expectCacheIdsToBe("uid0", ["storyId0"]);
    await userStories.expectCreatedAtToBeApproxNow("uid0", "storyId0");
  });
});
