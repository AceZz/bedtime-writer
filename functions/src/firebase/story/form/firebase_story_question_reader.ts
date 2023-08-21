import { QueryDocumentSnapshot } from "firebase-admin/firestore";
import {
  StoryChoice,
  StoryQuestion,
  StoryQuestionReader,
} from "../../../story";
import { FirestoreStoryQuestions } from "./firestore_story_questions";

/**
 * Read a list of Questions from Firebase.
 */
export class FirebaseStoryQuestionReader implements StoryQuestionReader {
  constructor(private readonly collection: FirestoreStoryQuestions) {}

  async readAll(): Promise<StoryQuestion[]> {
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
      snapshot.data().promptParam ?? "",
      snapshot.data().text ?? "",
      snapshot.data().priority ?? "",
      snapshot.data().datetime.toDate() ?? new Date(1900, 1, 1),
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
      snapshot.data().prompt,
      snapshot.data().image
    );
  }
}
