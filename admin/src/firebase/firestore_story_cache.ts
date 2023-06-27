import {
    CollectionReference,
    Firestore,
    getFirestore,
  } from "firebase-admin/firestore";
  import { FirestorePaths } from "./firestore_paths";
  
  /**
   * Helper class to manipulate the story cache collection. It follows this
   * schema:
   *
   * ```plain
   * TODO: Update below
   * <form_id>:
   *   start: timestamp
   *   numQuestions: int
   *   question0: <id>
   *   question0Choices: [<id>, <id>, ...]
   *   question1: <id>
   *   ...
   * ```
   */
  export class FirestoreStoryCache {
    private firestore: Firestore;
  
    constructor(readonly paths = new FirestorePaths(), firestore?: Firestore) {
      this.firestore = firestore ?? getFirestore();
    }
  
    formsRef(): CollectionReference {
      return this.firestore.collection(this.paths.story.cache);
    }
  }