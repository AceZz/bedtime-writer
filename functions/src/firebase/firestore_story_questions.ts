import {
  CollectionReference,
  DocumentReference,
  Firestore,
  getFirestore,
} from "firebase-admin/firestore";

/**
 * Helper class to manipulate the story questions collection (usually called
 * `story__questions`). It follows this schema:
 *
 * ```plain
 * <question_id>:
 *   text: str
 *
 *   choices/
 *     <choice_id>:
 *       text: str
 *       image: bytes
 * ```
 */
export class FirestoreStoryQuestions {
  private readonly firestore: Firestore;

  constructor(readonly collectionPath: string, firestore?: Firestore) {
    this.firestore = firestore ?? getFirestore();
  }

  choiceRef(questionId: string, choiceId: string): DocumentReference {
    return this.choicesRef(questionId).doc(choiceId);
  }

  choicesRef(questionId: string): CollectionReference {
    return this.questionRef(questionId).collection("choices");
  }

  questionRef(id: string): DocumentReference {
    return this.questionsRef().doc(id);
  }

  questionsRef(): CollectionReference {
    return this.firestore.collection(this.collectionPath);
  }
}
