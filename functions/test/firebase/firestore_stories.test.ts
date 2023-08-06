import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "@jest/globals";
import { FirestoreStories } from "../../src/firebase/firestore_stories";
import { initEnv, initFirebase } from "../../src/firebase/utils";

class TestFirestoreStories extends FirestoreStories {
  // All methods are inherited, and no abstract methods need to be implemented
}

describe("copyStory", () => {
  let storyId: string;
  let source: FirestoreStories;
  let destination: FirestoreStories;
  beforeAll(() => {
    initEnv();
    initFirebase(true);
  });

  beforeEach(async () => {
    // Clean up the test data
    storyId = "testStoryId";
    source = new TestFirestoreStories("test_source_stories");
    destination = new TestFirestoreStories("test_destination_stories");
  });

  afterEach(async () => {
    // Clean up the test data
    await source.storyRef(storyId).delete();
    await destination.storyRef(storyId).delete();
  });

  test("should copy a story including its subcollections", async () => {
    // Initialize test data
    const storyData = { title: "Test Story" };
    const subcollectionData1 = { key: "value1" };
    const subcollectionData2 = { key: "value2" };

    // Set up a test story and a subcollection in the source
    await source.storyRef(storyId).set(storyData);
    await source.imagesRef(storyId).add(subcollectionData1);
    await source.imagesRef(storyId).add(subcollectionData2);
    await source.partsRef(storyId).add(subcollectionData1);
    await source.partsRef(storyId).add(subcollectionData2);
    await source.promptsRef(storyId).add(subcollectionData1);
    await source.promptsRef(storyId).add(subcollectionData2);

    // Run the copy function
    await source.copyStory(storyId, destination);

    // Check that the story data is copied
    const copiedStoryData = (await destination.storyRef(storyId).get()).data();
    expect(copiedStoryData).toEqual(storyData);

    // Check that the subcollections are copied
    const subcollections = [
      {
        source: source.imagesRef(storyId),
        destination: destination.imagesRef(storyId),
      },
      {
        source: source.partsRef(storyId),
        destination: destination.partsRef(storyId),
      },
      {
        source: source.promptsRef(storyId),
        destination: destination.promptsRef(storyId),
      },
    ];

    for (const {
      source: sourceRef,
      destination: destinationRef,
    } of subcollections) {
      const sourceData = await sourceRef.get();
      const destinationData = await destinationRef.get();
      expect(destinationData.docs.map((doc) => doc.data())).toEqual(
        sourceData.docs.map((doc) => doc.data())
      );
    }
  });

  test("should throw an error if the destination already has a story with the same id", async () => {
    // Initialize test data
    const storyData = { title: "Test Story" };

    // Set up a test story in both the source and destination
    await source.storyRef(storyId).set(storyData);
    await destination.storyRef(storyId).set(storyData);

    // Expect the copy method to throw an error
    await expect(source.copyStory(storyId, destination)).rejects.toThrow();
  });
});
