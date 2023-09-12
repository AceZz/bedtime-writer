import {
  CollectionReference,
  DocumentReference,
  FieldPath,
  Query,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { FirestoreCollection } from "../../firestore_collection";
import {
  StoryChoice,
  StoryQuestion,
  StoryQuestionReader,
} from "../../../story";
import { listToMapById } from "../../../utils";

/**
 * Helper class to manipulate the story questions collection (usually called
 * `story__questions`). It follows this schema:
 *
 * ```plain
 * <question_id>:
 *   createdAt: createdAt
 *   priority: number
 *   promptParam: string
 *   text: str
 *
 *   choices/
 *     <choice_id>:
 *       image: bytes
 *       prompt: str
 *       text: str
 * ```
 */
export class FirestoreStoryQuestions
  extends FirestoreCollection
  implements StoryQuestionReader
{
  async get(params?: {
    ids?: string[] | undefined;
  }): Promise<Map<string, StoryQuestion>> {
    const ids = params?.ids;

    let query: Query = this.questionsRef();
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
    const snapshopts = await this.choicesRef(questionId).get();
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
