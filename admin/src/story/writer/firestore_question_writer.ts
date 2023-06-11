import {
  CollectionReference,
  DocumentReference,
  Firestore,
  getFirestore,
} from "firebase-admin/firestore";

import { Question } from "../question";
import { Writer } from "./writer";
import { Choice } from "../choice";

/**
 * This class writes a list of Question objects to a Firestore database.
 *
 * The Firestore collection follows this schema:
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
 *
 * Note: we do not use batching, as (per the Firestore documentation), the most
 * efficient way to insert a lot of documents is by parallelizing writes.
 */
export class FirestoreQuestionWriter implements Writer<Question[]> {
  private firestore: Firestore;

  constructor(
    readonly collectionName = "story__questions",
    firestore?: Firestore
  ) {
    this.firestore = firestore ?? getFirestore();
  }

  /**
   * Write `questions` to the Firestore database.
   *
   * After the operation, the database contains exactly the same data as what
   * was provided. In other words, any data not in `questions` is removed.
   */
  async write(questions: Question[]): Promise<void> {
    await this.removeExtraQuestions(questions);
    await Promise.all(
      questions.map((question) => this.writeQuestion(question))
    );
  }

  async removeExtraQuestions(questions: Question[]): Promise<void> {
    const questionIds = questions.map((question) => question.id);
    const snapshot = await this.questionsRef().get();

    // Delete every document which ID is not in `questionIds` (i.e. not in
    // `questions`).
    await Promise.all(
      snapshot.docs
        .filter((doc) => !questionIds.includes(doc.id))
        .map((doc) => doc.ref.delete())
    );
  }

  async writeQuestion(question: Question): Promise<void> {
    await Promise.all([
      this.questionRef(question.id).set({ text: question.text }),
      this.removeExtraChoices(question),
    ]);
    await Promise.all(
      question.choices.map((choice) => this.writeChoice(question.id, choice))
    );
  }

  async removeExtraChoices(question: Question): Promise<void> {
    const choiceIds = question.choices.map((choice) => choice.id);
    const snapshot = await this.choicesRef(question.id).get();

    // Delete every document which ID is not in `choiceIds` (i.e. not in
    // `question`).
    await Promise.all(
      snapshot.docs
        .filter((doc) => !choiceIds.includes(doc.id))
        .map((doc) => doc.ref.delete())
    );
  }

  async writeChoice(questionId: string, choice: Choice): Promise<void> {
    await this.choiceRef(questionId, choice.id).set({
      text: choice.text,
      image: await choice.image(),
    });
  }

  private choiceRef(questionId: string, choiceId: string): DocumentReference {
    return this.choicesRef(questionId).doc(choiceId);
  }

  private choicesRef(questionId: string): CollectionReference {
    return this.questionRef(questionId).collection("choices");
  }

  private questionRef(id: string): DocumentReference {
    return this.questionsRef().doc(id);
  }

  private questionsRef(): CollectionReference {
    return this.firestore.collection(this.collectionName);
  }
}
