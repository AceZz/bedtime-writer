import {
  CollectionReference,
  Firestore,
  getFirestore,
} from "firebase-admin/firestore";

/**
 * Helper class to manipulate the `story__forms` collection. It follows this
 * schema:
 *
 * ```plain
 * story__forms/
 *   <form_id>:
 *     start: timestamp
 *     numQuestions: int
 *     question0: <id>
 *     question0Choices: [<id>, <id>, ...]
 *     question1: <id>
 *     ...
 * ```
 */
export class FirestoreStoryForms {
  private firestore: Firestore;

  constructor(readonly collectionName = "story__forms", firestore?: Firestore) {
    this.firestore = firestore ?? getFirestore();
  }

  formsRef(): CollectionReference {
    return this.firestore.collection(this.collectionName);
  }
}
