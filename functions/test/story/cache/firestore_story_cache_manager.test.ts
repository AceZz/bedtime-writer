import { describe, test, beforeAll, beforeEach } from "@jest/globals";
import { initEnv, initFirebase } from "../../../src/firebase";

import { FirestoreTestUtils } from "../utils/firestore_test_utils";
import {
  FakeImageApi,
  FakeTextApi,
  StoryCacheManager,
  StoryCacheV1Manager,
} from "../../../src/story";
import { FORM_CHARACTER, FORM_CHARACTER_ID, REQUESTS_CHARACTER } from "../data";

describe("Firestore story cache manager", () => {
  const cache = new FirestoreTestUtils("firestore_story_cache_manager").cache;
  let storyCacheManager: StoryCacheManager;

  beforeAll(() => {
    initEnv();
    initFirebase(true);
    storyCacheManager = new StoryCacheV1Manager(
      FORM_CHARACTER_ID,
      new FakeTextApi(),
      new FakeImageApi(),
      cache.cache
    );
  });

  beforeEach(async () => {
    await cache.deleteCollection();
  });

  test("Should generate an array of correct StoryRequestV1 from Form", async () => {
    const input = await FORM_CHARACTER();
    const expected = await REQUESTS_CHARACTER();

    const actual = storyCacheManager.generateRequests(input);

    cache.expectSameRequestsNoRandom(actual, expected);
  });

  test("Should write the same number of stories as requests", async () => {
    const requests = await REQUESTS_CHARACTER();
    const expected = requests.length;

    await storyCacheManager.cacheStories(requests);

    cache.expectCountToBe(expected);
  }, 20000);

  test("Should write the right request fields for stories", async () => {
    const requests = await REQUESTS_CHARACTER();

    await storyCacheManager.cacheStories(requests);

    await cache.expectStoryRequestDocsToEqual(requests);
  }, 20000);
});
