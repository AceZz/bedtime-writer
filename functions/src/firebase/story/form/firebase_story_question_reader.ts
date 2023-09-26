import {
  FieldPath,
  Query,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import {
  StoryChoice,
  StoryQuestion,
  StoryQuestionReader,
} from "../../../story";
import { FirestoreStoryQuestions } from "./firestore_story_questions";
import { listToMapById } from "../../../utils";

/**
 * Read `StoryQuestion`s from Firebase.
 */
export class FirebaseStoryQuestionReader implements StoryQuestionReader {
  constructor(private readonly collection: FirestoreStoryQuestions) {}

  async get(params?: {
    ids?: string[] | undefined;
  }): Promise<Map<string, StoryQuestion>> {
    const ids = params?.ids;

    let query: Query = this.collection.questionsRef();
    if (ids !== undefined)
      query = query.where(FieldPath.documentId(), "in", ids);

    const snapshots = await query.get();
    const questions = await Promise.all(
      snapshots.docs.map((snapshot) => this.getQuestion(snapshot))
    );

    return listToMapById(questions);
  }

  private async getQuestion(
    snapshot: QueryDocumentSnapshot
  ): Promise<StoryQuestion> {
    return new StoryQuestion(
      snapshot.id,
      snapshot.data().promptParam ?? "",
      snapshot.data().text ?? "",
      snapshot.data().priority ?? "",
      snapshot.data().createdAt.toDate() ?? new Date(1900, 1, 1),
      await this.getChoices(snapshot.id)
    );
  }

  private async getChoices(questionId: string): Promise<StoryChoice[]> {
    const snapshopts = await this.collection.choicesRef(questionId).get();
    return Promise.all(
      snapshopts.docs.map((snapshot) => this.getChoice(snapshot))
    );
  }

  private async getChoice(
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
