import { describe, test, beforeAll, beforeEach } from "@jest/globals";
import { initEnv, initFirebase } from "../../../src/firebase";

import { FirestoreContextUtils } from "../../firebase/utils";
import { StoryCacheManager, StoryCacheV1Manager } from "../../../src/story";
import {
  FAKE_IMAGE_API,
  FAKE_TEXT_API,
  FORM_CHARACTER,
  FORM_CHARACTER_ID,
  REQUESTS_CHARACTER,
} from "../data";

describe("Firestore story cache manager", () => {
  const storyCache = new FirestoreContextUtils("story_cache_manager")
    .storyCache;
  let storyCacheManager: StoryCacheManager;

  beforeAll(() => {
    initEnv();
    initFirebase(true);
    storyCacheManager = new StoryCacheV1Manager(
      FORM_CHARACTER_ID,
      FAKE_TEXT_API,
      FAKE_IMAGE_API,
      storyCache
    );
  });

  beforeEach(async () => {
    await storyCache.delete();
  });

  test("Should generate an array of correct StoryRequestV1 from Form", async () => {
    const input = await FORM_CHARACTER();
    const expected = await REQUESTS_CHARACTER();

    const actual = storyCacheManager.generateRequests(input);

    storyCache.expectSameRequestsNoRandom(actual, expected);
  });

  test("Should write the same number of stories as requests", async () => {
    const requests = await REQUESTS_CHARACTER();
    const expected = requests.length;

    await storyCacheManager.cacheStories(requests);

    storyCache.expectCountToBe(expected);
  }, 20000);

  test("Should write the right request fields for stories", async () => {
    const requests = await REQUESTS_CHARACTER();

    await storyCacheManager.cacheStories(requests);

    await storyCache.expectStoryRequestDocsToEqual(requests);
  }, 20000);
});
