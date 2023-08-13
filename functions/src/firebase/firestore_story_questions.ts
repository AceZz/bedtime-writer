import {
  CollectionReference,
  DocumentReference,
} from "firebase-admin/firestore";
import { FirestoreCollection } from "./firestore_collection";

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
export class FirestoreStoryQuestions extends FirestoreCollection {
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
