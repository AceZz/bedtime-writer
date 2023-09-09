import {
  StoryForm,
  StoryFormReader,
  StoryFormReaderParams,
  StoryQuestion,
  StoryQuestionReader,
} from "../../../story";
import {
  FieldPath,
  Query,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { FirestoreStoryForms } from "./firestore_story_forms";

/**
 * Read a list of Forms from Firebase.
 */
export class FirebaseStoryFormReader implements StoryFormReader {
  constructor(
    private readonly formsCollection: FirestoreStoryForms,
    private readonly _questionReader?: StoryQuestionReader
  ) {}

  async get(params?: StoryFormReaderParams): Promise<Map<string, StoryForm>> {
    const query = this.buildQuery(params);
    const snapshots = await query.get();
    return this.docsToMap(snapshots.docs);
  }

  private buildQuery(params?: StoryFormReaderParams): Query {
    let query: Query = this.formsCollection.formsRef();

    const ids = params?.ids;
    if (ids !== undefined)
      query = query.where(FieldPath.documentId(), "in", ids);

    const isCached = params?.isCached;
    if (isCached !== undefined) query = query.where("isCached", "==", isCached);

    const isApproved = params?.isApproved;
    if (isApproved !== undefined)
      query = query.where("isApproved", "==", isApproved);

    return query;
  }

  private async docsToMap(
    docs: QueryDocumentSnapshot[]
  ): Promise<Map<string, StoryForm>> {
    const questions = await this.questionReader.get();

    return new Map(
      await Promise.all(
        docs.map(
          (doc) =>
            // Get a list of `[storyFormId, storyForm]`, and pass it to `Map`.
            [doc.id, this.readForm(doc, questions)] as [string, StoryForm]
        )
      )
    );
  }

  private readForm(
    snapshot: QueryDocumentSnapshot,
    availableQuestions: Map<string, StoryQuestion>
  ): StoryForm {
    const data = snapshot.data();
    const newQuestions: StoryQuestion[] = [];

    for (const index of [...Array(data.numQuestions).keys()]) {
      const questionId = data[`question${index}`];
      const question = availableQuestions.get(questionId);
      if (question === undefined) {
        throw Error(`Question ${questionId} does not exist in Firestore.`);
      }

      const choiceIds = data[`question${index}Choices`];
      const questionWithChoices = question.copyWithChoices(choiceIds);
      newQuestions.push(questionWithChoices);
    }

    return new StoryForm(newQuestions, data.datetime.toDate());
  }

  async getIds(params?: StoryFormReaderParams): Promise<string[]> {
    const query = this.buildQuery(params).select(FieldPath.documentId());
    const snapshots = await query.get();
    return snapshots.docs.map((doc) => doc.id);
  }

  private get questionReader(): StoryQuestionReader {
    if (this._questionReader === undefined) {
      throw new Error(
        "FirebaseStoryFormReader: `this._questionReader` is undefined."
      );
    }
    return this._questionReader;
  }
}
