import { expect } from "@jest/globals";
import { Timestamp } from "firebase-admin/firestore";

import { FirestoreUserStories } from "../../../src/firebase";

/**
 * Helper class to interact with the user stories Firestore collection.
 */
export class FirestoreUserStoriesUtils extends FirestoreUserStories {
  /**
   * Delete the collection and subcollections.
   *
   * Firebase must be initialized before calling this function.
   */
  async delete(): Promise<void> {
    const docs = (await this.storiesRef().get()).docs;
    console.log(docs.length);
    await Promise.all(
      docs.map(async (doc_) => {
        console.log("deleted");
        await this.deleteCacheSubcollection(doc_.id);
        await doc_.ref.delete();
      })
    );
  }

  /* Delete the cache subcollection for this uid. */
  private async deleteCacheSubcollection(uid: string): Promise<void> {
    const docs = (await this.cacheRef(uid).get()).docs;
    await Promise.all(docs.map(async (doc_) => doc_.ref.delete()));
  }

  /* Init a stories doc for the user. */
  async initDoc(uid: string): Promise<void> {
    await this.storiesDocRef(uid).create({ createdAt: new Date(2020, 1, 1) });
  }

  /** Create a doc in the cache subcollection of user.
   *
   * Only recommended for specific tests as cache subcollection
   * normally has the same ids as the story ids from story collection.
   */
  async createCacheStory(
    uid: string,
    storyId: string,
    data: object
  ): Promise<void> {
    await this.cacheDocRef(uid, storyId).create(data);
  }

  /**
   * Checks the doc ids of the cache subcollection of user stories.
   */
  async expectCacheIdsToBe(uid: string, expected: string[]): Promise<void> {
    const docs = (await this.cacheRef(uid).get()).docs;
    const actual = docs.map((doc) => doc.id);

    expect(actual.sort()).toEqual(expected.sort());
  }

  /**
   * Check that createdAt is approx now for the cache doc.
   */
  async expectCreatedAtToBeApproxNow(
    uid: string,
    storyId: string
  ): Promise<void> {
    const data = (await this.cacheDocRef(uid, storyId).get()).data();
    const actual = data?.createdAt;
    const expected = Timestamp.now();

    const tolerance = 60000; // 1 minute tolerance
    const timeDifference = Math.abs(actual.toMillis() - expected.toMillis());

    expect(timeDifference).toBeLessThanOrEqual(tolerance);
  }
}
