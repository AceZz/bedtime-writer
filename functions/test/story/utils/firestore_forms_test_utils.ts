/**
 * Contains fixtures and utils for `Form`-related tests.
 */

import {
  CollectionReference,
  Timestamp,
  getFirestore,
} from "firebase-admin/firestore";
import {
  FirestoreStoryForms,
  FirestoreStoryQuestions,
} from "../../../src/firebase";
import {
  StoryForm,
  FirebaseFormReader,
  FirebaseFormWriter,
} from "../../../src/story";
import { expect } from "@jest/globals";

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

const QUESTIONS_0 = ["question1", "question2"];

const FORM_RESPONSES_0 = [
  ["choice1", "choice1"],
  ["choice2", "choice1"],
];

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
  constructor(
    readonly firestoreForms: FirestoreStoryForms,
    readonly firestoreQuestions: FirestoreStoryQuestions
  ) {}

  get reader(): FirebaseFormReader {
    return new FirebaseFormReader(this.firestoreForms);
  }

  get writer(): FirebaseFormWriter {
    return new FirebaseFormWriter(this.firestoreForms, this.firestoreQuestions);
  }

  samples(): StoryForm[] {
    return [FORM_0, FORM_1, FORM_2, FORM_3];
  }

  serializedSamples(): object[] {
    return [SERIALIZED_FORM_0, SERIALIZED_FORM_1];
  }

  collectionRef(): CollectionReference {
    return this.firestoreForms.formsRef();
  }

  questions(): string[] {
    return QUESTIONS_0;
  }

  formResponses(): string[][] {
    return FORM_RESPONSES_0;
  }

  /**
   * Delete the collection.
   *
   * Firebase must be initialized before calling this function.
   */
  async deleteCollection(): Promise<void> {
    const firestore = getFirestore();
    const forms = await firestore
      .collection(this.firestoreForms.collectionPath)
      .get();
    await Promise.all(forms.docs.map((form) => form.ref.delete()));
  }
  /**
   * Checks the number of forms in the Firestore database.
   *
   * Firebase must be initialized before calling this function.
   */
  async expectCountToBe(expected: number): Promise<void> {
    const firestore = getFirestore();
    const forms = firestore.collection(this.firestoreForms.collectionPath);
    const query = await forms.count().get();

    expect(query.data().count).toBe(expected);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async expectToBe(expected: any[]): Promise<void> {
    const firestore = getFirestore();
    const forms = firestore.collection(this.firestoreForms.collectionPath);
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
