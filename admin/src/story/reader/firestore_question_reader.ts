import { Question } from "../question";
import { Reader } from "./reader";
import { Choice } from "../choice";
import { FirestoreQuestions } from "../firestore/firestore_questions";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";

/**
 * Read a list of Questions from a Firestore collection.
 */
export class FirestoreQuestionReader implements Reader<Question[]> {
  private collection: FirestoreQuestions;

  constructor(collectionName?: string) {
    this.collection = new FirestoreQuestions(collectionName);
  }

  async read(): Promise<Question[]> {
    const snapshots = await this.collection.questionsRef().get();
    return Promise.all(
      snapshots.docs.map((snapshot) => this.readQuestion(snapshot))
    );
  }

  private async readQuestion(
    snapshot: QueryDocumentSnapshot
  ): Promise<Question> {
    return new Question(
      snapshot.id,
      snapshot.data().text ?? "",
      await this.readChoices(snapshot.id)
    );
  }

  private async readChoices(questionId: string): Promise<Choice[]> {
    const snapshopts = await this.collection.choicesRef(questionId).get();
    return Promise.all(
      snapshopts.docs.map((snapshot) => this.readChoice(snapshot))
    );
  }

  private async readChoice(snapshot: QueryDocumentSnapshot): Promise<Choice> {
    return new Choice(snapshot.id, snapshot.data().text, snapshot.data().image);
  }
}
