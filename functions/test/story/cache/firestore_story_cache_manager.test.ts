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

  test("Should generate an array of StoryRequestV1 from Form", () => {
    const input = cache.formSample();
    const formId = cache.formIdSample();
    const expected = cache.requestsSample();
    const storyCacheManager = new FirestoreStoryCacheManager(formId);

    const actual = storyCacheManager.generateRequestsFromForm(input);

    cache.expectSameRequestsNoRandom(actual, expected);
  });

  //TODO: test cache stories
});
