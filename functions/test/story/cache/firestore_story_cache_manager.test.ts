import { describe, test, beforeAll, beforeEach } from "@jest/globals";
import { initFirebase } from "../../../src/firebase/utils";
import { FirestoreStoryCacheManager } from "../../../src/story/cache/firestore_story_cache_manager";

import { FirestoreTestUtils } from "../utils/firestore_test_utils";

const cache = new FirestoreTestUtils("question_writer").cache;

describe("Firestore story cache manager", () => {
  beforeAll(() => {
    initFirebase(true);
  });

  beforeEach(async () => {
    await cache.deleteCollection();
  });

  test("Should generate an array of correct StoryRequestV1 from Form", () => {
    const input = cache.formSample();
    const formId = cache.formIdSample();
    const expected = cache.requestsSample();
    const storyCacheManager = new FirestoreStoryCacheManager(formId);

    const actual = storyCacheManager.generateRequestsFromForm(input);

    cache.expectSameRequestsNoRandom(actual, expected);
  });

  test("Should write the same number of stories as requests", async () => {
    const input = cache.requestsSample();
    const expected = input.length;
    const storyCacheManager = cache.manager;

    await storyCacheManager.cacheStories(input);

    cache.expectCountToBe(expected);
  });

  test("Should write the right request fields for stories", async () => {
    const input = cache.requestsSample();

    const storyCacheManager = cache.manager;
    await storyCacheManager.cacheStories(input);

    await cache.expectStoryRequestDocsToEqual(input);
  });
});
