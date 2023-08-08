import { StoryQuestion } from "../story_question";
import { Reader } from "./reader";
import { StoryChoice } from "../story_choice";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { FirestorePaths, FirestoreStoryQuestions } from "../../../firebase";

/**
 * Read a list of Questions from Firebase.
 */
export class FirebaseQuestionReader implements Reader<StoryQuestion[]> {
  private collection: FirestoreStoryQuestions;

  constructor(paths?: FirestorePaths) {
    this.collection = new FirestoreStoryQuestions(paths);
  }

  async read(): Promise<StoryQuestion[]> {
    const snapshots = await this.collection.questionsRef().get();
    return Promise.all(
      snapshots.docs.map((snapshot) => this.readQuestion(snapshot))
    );
  }

  private async readQuestion(
    snapshot: QueryDocumentSnapshot
  ): Promise<StoryQuestion> {
    return new StoryQuestion(
      snapshot.id,
      snapshot.data().text ?? "",
      await this.readChoices(snapshot.id)
    );
  }

  private async readChoices(questionId: string): Promise<StoryChoice[]> {
    const snapshopts = await this.collection.choicesRef(questionId).get();
    return Promise.all(
      snapshopts.docs.map((snapshot) => this.readChoice(snapshot))
    );
  }

  private async readChoice(
    snapshot: QueryDocumentSnapshot
  ): Promise<StoryChoice> {
    return new StoryChoice(
      snapshot.id,
      snapshot.data().text,
      snapshot.data().image
    );
  }
}