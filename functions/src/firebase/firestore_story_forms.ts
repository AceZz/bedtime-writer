import {
  CollectionReference,
  DocumentReference,
} from "firebase-admin/firestore";
import { FirestoreCollection } from "./firestore_collection";

/**
 * Helper class to manipulate the story forms collection (usually called
 * `story__forms`). It follows this schema:
 *
 * ```plain
 * <form_id>:
 *   datetime: timestamp
 *   numQuestions: int
 *   question0: <id>
 *   question0Choices: [<id>, <id>, ...]
 *   question1: <id>
 *   ...
 * ```
 */
export class FirestoreStoryForms extends FirestoreCollection {
  formsRef(): CollectionReference {
    return this.firestore.collection(this.collectionPath);
  }

  formRef(formId: string): DocumentReference {
    return this.formsRef().doc(formId);
  }

  /**
   * Return the form's questions and all possible associated choices.
   *
   * The order of the questions matches the order of the choices in a form
   * response.
   * A form response is defined by the complete series of choices a user made.
   */
  async getQuestionsToChoices(formId: string): Promise<Map<string, string[]>> {
    const formDoc = await this.formRef(formId).get();
    const formData = formDoc.data();

    const questionsToChoices: Map<string, string[]> = new Map();
    if (formData != undefined) {
      const numQuestions = formData.numQuestions;
      for (let i = 0; i < numQuestions; i++) {
        const question = formData[`question${i}`];
        const choices = formData[`question${i}Choices`];
        questionsToChoices.set(question, choices);
      }
    }

    return questionsToChoices;
  }
}
