/**
 * Contains fixtures and utils for `Form`-related tests.
 */

import { CollectionReference, getFirestore } from "firebase-admin/firestore";
import { Form } from "../../../src/story/form";
import { FirestoreFormReader } from "../../../src/story/reader/firestore_form_reader";
import { FirestoreForms } from "../../../src/story/firestore/firestore_forms";

/**
 * Works with QUESTIONS_0.
 */
const FORM_0 = new Form(
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
const FORM_1 = new Form(
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
 * Helper class to interact with the story forms Firestore collection.
 */
export class FirestoreFormsTestUtils {
  collectionName: string;

  constructor(readonly prefix: string) {
    this.collectionName = `${this.prefix}__story__forms`;
  }

  get reader(): FirestoreFormReader {
    return new FirestoreFormReader(this.collectionName);
  }

  samples(): Form[] {
    return [FORM_0, FORM_1];
  }

  serializedSamples(): object[] {
    return [SERIALIZED_FORM_0, SERIALIZED_FORM_1];
  }

  collectionRef(): CollectionReference {
    const forms = new FirestoreForms(this.collectionName);
    return forms.formsRef();
  }

  /**
   * Delete the collection.
   *
   * Firebase must be initialized before calling this function.
   */
  async deleteCollection(): Promise<void> {
    const firestore = getFirestore();
    const forms = await firestore.collection(this.collectionName).get();
    await Promise.all(forms.docs.map((form) => form.ref.delete()));
  }
}
