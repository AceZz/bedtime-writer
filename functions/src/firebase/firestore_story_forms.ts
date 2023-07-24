import {
  CollectionReference,
  DocumentReference,
  Firestore,
  getFirestore,
} from "firebase-admin/firestore";
import { cartesianProduct } from "../story/cache/utils";
import { FirestorePaths } from "./firestore_paths";

/**
 * Helper class to manipulate the story forms collection. It follows this
 * schema:
 *
 * ```plain
 * <form_id>:
 *   start: timestamp
 *   numQuestions: int
 *   question0: <id>
 *   question0Choices: [<id>, <id>, ...]
 *   question1: <id>
 *   ...
 * ```
 */
export class FirestoreStoryForms {
  private firestore: Firestore;

  constructor(readonly paths = new FirestorePaths(), firestore?: Firestore) {
    this.firestore = firestore ?? getFirestore();
  }

  formsRef(): CollectionReference {
    return this.firestore.collection(this.paths.story.forms);
  }

  formRef(formId: string): DocumentReference {
    return this.formsRef().doc(formId);
  }

  async getChoicesCombinations(formId: string): Promise<string[][]> {
    const formDoc = await this.formRef(formId).get();
    const formData = formDoc.data();
    const choicesCombinations: string[][] = [];
    if (formData != undefined) {
      const numQuestions = formData.numQuestions;
      for (let i = 0; i < numQuestions; i++) {
        console.log(`data: ${formData[`question${i}Choices`]}`);
        choicesCombinations.push(formData[`question${i}Choices`]);
      }
    }
    return cartesianProduct(choicesCombinations);
  }
}
