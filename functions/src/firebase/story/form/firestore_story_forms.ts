import {
  CollectionReference,
  DocumentReference,
} from "firebase-admin/firestore";
import { FirestoreCollection } from "../../firestore_collection";

/**
 * Helper class to manipulate the story forms collection (usually called
 * `story__forms`). It follows this schema:
 *
 * ```plain
 * <form_id>:
 *   datetime: timestamp
 *   isCached: bool
 *   isApproved: bool
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
}
