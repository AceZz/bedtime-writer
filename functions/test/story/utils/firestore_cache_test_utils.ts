/**
 * Contains fixtures and utils for `Cache`-related tests.
 */

import { expect } from "@jest/globals";
import { CollectionReference, getFirestore } from "firebase-admin/firestore";

import { StoryRequestV1 } from "../../../src/story";
import { FirestoreStoryCache } from "../../../src/firebase";

/**
 * Helper class to interact with the story cache Firestore collection.
 */
export class FirestoreCacheTestUtils {
  constructor(readonly cache: FirestoreStoryCache) {}

  collectionRef(): CollectionReference {
    return this.cache.storiesRef();
  }

  /**
   * Delete the collection.
   *
   * Firebase must be initialized before calling this function.
   */
  async deleteCollection(): Promise<void> {
    const firestore = getFirestore();
    const cache = await firestore.collection(this.cache.collectionPath).get();
    await Promise.all(cache.docs.map((story) => story.ref.delete()));
  }
  /**
   * Checks the number of cache stories in the Firestore database.
   *
   * Firebase must be initialized before calling this function.
   */
  async expectCountToBe(expected: number): Promise<void> {
    const firestore = getFirestore();
    const cache = firestore.collection(this.cache.collectionPath);
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
    const cache = firestore.collection(this.cache.collectionPath);
    const query = await cache.get();
    const expected = requests.map((request) => {
      return {
        logic: request.logic,
        version: request.version,
        ...request.data,
      };
    });

    const promises = query.docs.map(async (doc) => {
      return await doc.data().request;
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
