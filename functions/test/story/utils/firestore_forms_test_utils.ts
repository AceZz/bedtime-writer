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
import {
  FORM_0,
  FORM_1,
  FORM_2,
  FORM_3,
  FORM_RESPONSES_0,
  FORM_QUESTIONS_0,
  SERIALIZED_FORM_0,
  SERIALIZED_FORM_1,
} from "../data";

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
    return FORM_QUESTIONS_0;
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
