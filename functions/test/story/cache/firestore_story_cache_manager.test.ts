import { describe, test, beforeAll, beforeEach } from "@jest/globals";
import { initFirebase } from "../../../src/firebase/utils";

import { FirestoreTestUtils } from "../utils/firestore_test_utils";

const cache = new FirestoreTestUtils("firestore_story_cache_manager").cache;

describe("Firestore story cache manager", () => {
  beforeAll(() => {
    initFirebase(true);
  });

  beforeEach(async () => {
    await cache.deleteCollection();
  });

  test("Should generate an array of correct StoryRequestV1 from Form", () => {
    const input = cache.formSample();
    const expected = cache.requestsSample();
    const storyCacheManager = cache.manager;

    const actual = storyCacheManager.generateRequests(input);

    cache.expectSameRequestsNoRandom(actual, expected);
  });

  test("Should write the same number of stories as requests", async () => {
    const input = cache.requestsSample();
    const expected = input.length;
    const storyCacheManager = cache.manager;

    await storyCacheManager.cacheStories(input);

    cache.expectCountToBe(expected);
  }, 20000);

  test("Should write the right request fields for stories", async () => {
    const input = cache.requestsSample();

    const storyCacheManager = cache.manager;
    await storyCacheManager.cacheStories(input);

    await cache.expectStoryRequestDocsToEqual(input);
  }, 20000);
});
