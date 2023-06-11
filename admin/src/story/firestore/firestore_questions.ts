import {
  CollectionReference,
  DocumentReference,
  Firestore,
  getFirestore,
} from "firebase-admin/firestore";

/**
 * Helper class to manipulate the `story__questions` collection. It follows this
 * schema:
 *
 * ```plain
 * story__questions/
 *   <question_id>:
 *     text: str
 *
 *     choices/
 *       <choice_id>:
 *         text: str
 *         image: bytes
 * ```
 */
export class FirestoreQuestions {
  private firestore: Firestore;

  constructor(
    readonly collectionName = "story__questions",
    firestore?: Firestore
  ) {
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
    return this.firestore.collection(this.collectionName);
  }
}
