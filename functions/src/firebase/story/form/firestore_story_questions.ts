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
  StoryQuestionWriter,
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
  implements StoryQuestionReader, StoryQuestionWriter
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

  async write(questions: StoryQuestion[]): Promise<void> {
    // Note: we make the requests one by one. This is far from being the most
    // efficient, as the Firestore documentation recommends to parallelize
    // writes. However, we had random bugs with this approach. As this tool does
    // not need to be fast, we thus chose to do sequential writes.
    await this.removeExtraQuestions(questions);

    for (const question of questions) {
      await this.writeQuestion(question);
    }
  }

  private async removeExtraQuestions(
    questions: StoryQuestion[]
  ): Promise<void> {
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

  private async writeQuestion(question: StoryQuestion): Promise<void> {
    await this.questionRef(question.id).set({
      promptParam: question.promptParam,
      text: question.text,
      priority: question.priority,
      createdAt: question.createdAt,
    });
    await this.removeExtraChoices(question);

    for (const choice of question.choices.values()) {
      await this.writeChoice(question.id, choice);
    }
  }

  private async removeExtraChoices(question: StoryQuestion): Promise<void> {
    const choiceIds = question.choiceIds;
    const snapshot = await this.choicesRef(question.id).get();

    // Delete every document which ID is not in `choiceIds` (i.e. not in
    // `question`).
    await Promise.all(
      snapshot.docs
        .filter((doc) => !choiceIds.includes(doc.id))
        .map((doc) => doc.ref.delete())
    );
  }

  private async writeChoice(
    questionId: string,
    choice: StoryChoice
  ): Promise<void> {
    await this.choiceRef(questionId, choice.id).set({
      text: choice.text,
      prompt: choice.prompt,
      image: choice.image,
    });
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
