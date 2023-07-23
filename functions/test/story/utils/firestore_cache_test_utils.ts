/**
 * Contains fixtures and utils for `Cache`-related tests.
 */

import { CollectionReference, getFirestore } from "firebase-admin/firestore";
import { StoryForm } from "../../../src/story/story_form";
import { expect } from "@jest/globals";
import { FirestorePaths } from "../../../src/firebase/firestore_paths";
import { FirestoreStoryCacheManager } from "../../../src/story/cache/firestore_story_cache_manager";
import { FirestoreStoryCache } from "../../../src/firebase/firestore_story_cache";
import { StoryRequestV1 } from "../../../src/story/request/v1";
import { CLASSIC_LOGIC } from "../../../src/story/logic";
import { FakeImageApi, FakeTextApi } from "../../../src/story";

/**
 * Initializes a dummy form_id. Should be the form doc ref in real case.
 */
const FORM_ID_0 = "form_id_0";

/**
 * Initializes other request data fields.
 */
const AUTHOR = "@CACHE_BATCH_JOB";
const CHARACTER_NAMES = ["name1", "name2"];
const CHARACTER_FLAW = "flaw1";
const DURATION = 1;
const STYLE = "style1";

/**
 * Initializes a sample story form for REQUESTS_0.
 */
const FORM_0 = new StoryForm(
  new Map([
    ["characterName", CHARACTER_NAMES],
    ["characterFlaw", [CHARACTER_FLAW]],
  ]),
  new Date("2020-01-01T12:00:00Z")
);

/**
 * Computes requests data from FORM_0.
 */
const REQUESTS_DATA_0 = CHARACTER_NAMES.map((name) => {
  return {
    author: AUTHOR,
    formId: FORM_ID_0,
    duration: DURATION,
    style: STYLE,
    characterName: name,
    characterFlaw: CHARACTER_FLAW,
  };
});

/**
 * Computes requests from REQUESTS_DATA_0.
 */
const REQUESTS_0 = REQUESTS_DATA_0.map((data) => {
  return new StoryRequestV1(CLASSIC_LOGIC, data);
});

/**
 * Sets Api to use.
 */
const FAKE_TEXT_API = new FakeTextApi();
const FAKE_IMAGE_API = new FakeImageApi();

/**
 * Helper class to interact with the story cache Firestore collection.
 */
export class FirestoreCacheTestUtils {
  constructor(readonly paths: FirestorePaths) {}

  get manager(): FirestoreStoryCacheManager {
    return new FirestoreStoryCacheManager(
      FORM_ID_0,
      FAKE_TEXT_API,
      FAKE_IMAGE_API,
      this.paths
    );
  }

  formSample(): StoryForm {
    return FORM_0;
  }

  formIdSample(): string {
    return FORM_ID_0;
  }

  requestsSample(): StoryRequestV1[] {
    return REQUESTS_0;
  }

  collectionRef(): CollectionReference {
    const cache = new FirestoreStoryCache(this.paths);
    return cache.storiesRef();
  }

  /**
   * Delete the collection.
   *
   * Firebase must be initialized before calling this function.
   */
  async deleteCollection(): Promise<void> {
    const firestore = getFirestore();
    const cache = await firestore.collection(this.paths.story.cache).get();
    await Promise.all(cache.docs.map((story) => story.ref.delete()));
  }
  /**
   * Checks the number of cache stories in the Firestore database.
   *
   * Firebase must be initialized before calling this function.
   */
  async expectCountToBe(expected: number): Promise<void> {
    const firestore = getFirestore();
    const cache = firestore.collection(this.paths.story.cache);
    const query = await cache.count().get();

    expect(query.data().count).toBe(expected);
  }

  private expectSameRequestsLength(
    actual: StoryRequestV1[],
    expected: StoryRequestV1[]
  ) {
    expect(actual.length).toBe(expected.length);
  }

  private expectSameRequestsLogic(
    actual: StoryRequestV1[],
    expected: StoryRequestV1[]
  ) {
    this.expectSameRequestsLength(actual, expected);
    actual.forEach((actualRequest, index) => {
      const expectedRequest = expected[index];
      expect(actualRequest.logic).toEqual(expectedRequest.logic);
    });
  }

  expectSameRequestsNoRandom(
    actual: StoryRequestV1[],
    expected: StoryRequestV1[]
  ) {
    this.expectSameRequestsLogic(actual, expected);
    const actualDataNoRandom = actual.map((request) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { duration, style, ...rest } = request.data;
      return rest;
    });
    const expectedDataNoRandom = expected.map((request) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { duration, style, ...rest } = request.data;
      return rest;
    });
    expect(actualDataNoRandom).toEqual(expectedDataNoRandom);
  }

  async expectStoryRequestDocsToEqual(requests: StoryRequestV1[]) {
    const firestore = getFirestore();
    const cache = firestore.collection(this.paths.story.cache);
    const query = await cache.get();
    const expected = requests.map((request) => {
      return { logic: request.logic, ...request.data };
    });

    const promises = query.docs.map(async (doc) => {
      const requestDoc = await doc.ref.collection("request").doc("v1").get();
      return requestDoc.data();
    });
    const actual = await Promise.all(promises);

    this.expectArraysToEqual(actual, expected);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private expectArraysToEqual(actual: any[], expected: any[]) {
    // If A /inc B, B /inc A and len(A)=len(B) then A = B
    expect(actual.length).toBe(expected.length);
    actual.forEach((x) => {
      expect(expected).toContainEqual(x);
    });
    expected.forEach((x) => {
      expect(actual).toContainEqual(x);
    });
  }
}
