/**
 * Contains fixtures and utils for `Form`-related tests.
 */

import {
  CollectionReference,
  Timestamp,
  getFirestore,
} from "firebase-admin/firestore";
import { StoryForm } from "../../../src/story/story_form";
import { FirestoreFormReader } from "../../../src/story/reader/firestore_form_reader";
import { FirestoreStoryForms } from "../../../src/firebase/firestore_story_forms";
import { FirebaseFormWriter } from "../../../src/story/writer/firebase_form_writer";
import { expect } from "@jest/globals";
import { FirestorePaths } from "../../../src/firebase/firestore_paths";

/**
 * Works with QUESTIONS_0.
 */
const FORM_0 = new StoryForm(
  new Map([
    ["question1", ["choice1", "choice2"]],
    ["question2", ["choice1"]],
  ]),
  new Date("2020-01-01T12:00:00Z")
);

const SERIALIZED_FORM_0 = {
  start: new Date("2020-01-01T12:00:00Z"),
  numQuestions: 2,
  question0: "question1",
  question0Choices: ["choice1", "choice2"],
  question1: "question2",
  question1Choices: ["choice1"],
};

/**
 * Works with QUESTIONS_0.
 */
const FORM_1 = new StoryForm(
  new Map([
    ["question1", ["choice1", "choice2"]],
    ["question2", ["choice2"]],
  ]),
  new Date("2023-01-01T12:00:00Z")
);

const SERIALIZED_FORM_1 = {
  start: new Date("2023-01-01T12:00:00Z"),
  numQuestions: 2,
  question0: "question1",
  question0Choices: ["choice1", "choice2"],
  question1: "question2",
  question1Choices: ["choice2"],
};

/**
 * Does not work with QUESTIONS_0 (question does not exist).
 */
export const FORM_2 = new StoryForm(
  new Map([["doesnotexist", ["one", "two", "three"]]]),
  new Date("2023-01-01T12:00:00Z")
);

/**
 * Does not work with QUESTIONS_0 (choice does not exist).
 */
export const FORM_3 = new StoryForm(
  new Map([["question1", ["doesnotexist", "choice2"]]]),
  new Date("2023-01-01T12:00:00Z")
);

/**
 * Helper class to interact with the story forms Firestore collection.
 */
export class FirestoreFormsTestUtils {
  constructor(readonly paths: FirestorePaths) {}

  get reader(): FirestoreFormReader {
    return new FirestoreFormReader(this.paths);
  }

  get writer(): FirebaseFormWriter {
    return new FirebaseFormWriter(this.paths);
  }

  samples(): StoryForm[] {
    return [FORM_0, FORM_1, FORM_2, FORM_3];
  }

  serializedSamples(): object[] {
    return [SERIALIZED_FORM_0, SERIALIZED_FORM_1];
  }

  collectionRef(): CollectionReference {
    const forms = new FirestoreStoryForms(this.paths);
    return forms.formsRef();
  }

  /**
   * Delete the collection.
   *
   * Firebase must be initialized before calling this function.
   */
  async deleteCollection(): Promise<void> {
    const firestore = getFirestore();
    const forms = await firestore.collection(this.paths.story.forms).get();
    await Promise.all(forms.docs.map((form) => form.ref.delete()));
  }
  /**
   * Checks the number of forms in the Firestore database.
   *
   * Firebase must be initialized before calling this function.
   */
  async expectCountToBe(expected: number): Promise<void> {
    const firestore = getFirestore();
    const forms = firestore.collection(this.paths.story.forms);
    const query = await forms.count().get();

    expect(query.data().count).toBe(expected);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async expectToBe(expected: any[]): Promise<void> {
    const firestore = getFirestore();
    const forms = firestore.collection(this.paths.story.forms);
    const snapshots = await forms.orderBy("start").get();

    const tested = snapshots.docs.map((snapshot) => snapshot.data());
    const expected_ = expected.map((item) => {
      return {
        ...item,
        start: new Timestamp(item.start.getTime() / 1000, 0),
      };
    });
    expected_.sort((a, b) => a.start - b.start);

    expect(tested).toStrictEqual(expected_);
  }
}
