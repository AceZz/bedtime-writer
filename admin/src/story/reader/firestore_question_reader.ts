import { Question } from "../question";
import { Reader } from "./reader";
import { StoryChoice } from "../story_choice";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { FirestoreStoryQuestions } from "../../firebase/firestore_story_questions";
import { FirestorePaths } from "../../firebase/firestore_paths";

/**
 * Read a list of Questions from a Firestore collection.
 */
export class FirestoreQuestionReader implements Reader<Question[]> {
  private collection: FirestoreStoryQuestions;

  constructor(paths?: FirestorePaths) {
    this.collection = new FirestoreStoryQuestions(paths);
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
