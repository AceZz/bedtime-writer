import {
  CollectionReference,
  DocumentReference,
  Firestore,
  getFirestore,
} from "firebase-admin/firestore";
import { StoryForm } from "../story/story_form";
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

  /**
   * Return the form's questions and all possible associated form responses.
   *
   * The order of the questions match the order of the choices in a form response.
   * A form response is defined by the complete series of choices a user made.
   */
  async getAllFormResponses(
    formId: string
  ): Promise<{ questions: string[]; formResponses: string[][] }> {
    const formDoc = await this.formRef(formId).get();
    const formData = formDoc.data();

    const questions: string[] = [];
    const choices: string[][] = [];
    if (formData != undefined) {
      const numQuestions = formData.numQuestions;
      for (let i = 0; i < numQuestions; i++) {
        questions.push(formData[`question${i}`]);
        choices.push(formData[`question${i}Choices`]);
      }
    }

    const formResponses = cartesianProduct(choices);
    return { questions: questions, formResponses: formResponses };
  }
}
