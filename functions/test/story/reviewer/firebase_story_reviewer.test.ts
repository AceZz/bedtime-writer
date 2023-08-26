import { describe, test, beforeAll, beforeEach } from "@jest/globals";
import { initEnv, initFirebase } from "../../../src/firebase";

import { FirestoreContextUtils } from "../../firebase/utils";
import {
  FakeImageApi,
  FakeTextApi,
  FAKE_IMAGE_BYTES_1,
  FirebaseStoryReviewer,
  StoryCacheV1Manager,
} from "../../../src/story";
import { FORM_CHARACTER_ID, REQUESTS_CHARACTER } from "../data";

describe("Firestore story cache manager", () => {
  const SEED_0 = 0;
  const SEED_1 = 1;
  const storyCache = new FirestoreContextUtils("story_reviewer").storyCache;
  const storyReviewer = new FirebaseStoryReviewer(storyCache);
  const storyCacheManager = new StoryCacheV1Manager(
    FORM_CHARACTER_ID,
    new FakeTextApi(),
    new FakeImageApi(SEED_0),
    storyCache
  );

  beforeAll(() => {
    initEnv();
    initFirebase(true);
  });

  beforeEach(async () => {
    await storyCache.delete();
  });

  test("Should regenerate one image when called after caching step", async () => {
    const requests = await REQUESTS_CHARACTER();
    const storyId = (await storyCacheManager.cacheStories(requests))[0];
    const imageId = (await storyCache.getImageIds(storyId))[0];

    const imageApi = new FakeImageApi(SEED_1);
    await storyReviewer.regenImage(storyId, imageId, imageApi);

    storyCache.expectImageToBe(storyId, imageId, FAKE_IMAGE_BYTES_1);
  }, 20000);

  test("Should approve image when called after caching step", async () => {
    const requests = await REQUESTS_CHARACTER();
    const storyId = (await storyCacheManager.cacheStories(requests))[0];
    const imageId = (await storyCache.getImageIds(storyId))[0];
    storyCache.expectImageToNotBeApproved(storyId, imageId);

    await storyReviewer.approveImage(storyId, imageId);

    storyCache.expectImageToBeApproved(storyId, imageId);
  }, 20000);
});
