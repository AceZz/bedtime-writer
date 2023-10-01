import {
  CollectionReference,
  DocumentReference,
  FieldPath,
  Query,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import {
  StoryForm,
  StoryFormReader,
  StoryFormReaderParams,
  StoryQuestion,
  StoryQuestionReader,
} from "../../../story";
import {
  FirestoreCollection,
  FirestoreProvider,
} from "../../firestore_collection";
import { FirestoreDocument, dumpToCollection } from "../../firestore_utils";
import { storyFormToFirestore } from "./firebase_story_form_writer";
import { transformItems } from "../../../utils";

export type FirestoreStoryForm = {
  createdAt: Date;
  isApproved: boolean;
  isCached: boolean;
  numQuestions: number;
  [key: `question${number}`]: string;
  [key: `question${number}Choices`]: string[];
};

/**
 * Helper class to manipulate the story forms collection (usually called
 * `story__forms`). It follows this schema:
 *
 * ```plain
 * <form_id>:
 *   createdAt: timestamp
 *   isApproved: bool
 *   isCached: bool
 *   numQuestions: int
 *   question0: <id>
 *   question0Choices: [<id>, <id>, ...]
 *   question1: <id>
 *   ...
 * ```
 */
export class FirestoreStoryForms
  extends FirestoreCollection
  implements StoryFormReader
{
  constructor(
    collectionPath: string,
    firestoreProvider: FirestoreProvider,
    readonly questionReader: StoryQuestionReader
  ) {
    super(collectionPath, firestoreProvider);
  }

  async get(params?: StoryFormReaderParams): Promise<Map<string, StoryForm>> {
    const query = this.buildQuery(params);
    const snapshots = await query.get();
    return this.docsToMap(snapshots.docs);
  }

  private buildQuery(params?: StoryFormReaderParams): Query {
    let query: Query = this.formsRef();

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

    return new StoryForm(newQuestions, data.createdAt.toDate());
  }

  async getIds(params?: StoryFormReaderParams): Promise<string[]> {
    const query = this.buildQuery(params).select(FieldPath.documentId());
    const snapshots = await query.get();
    return snapshots.docs.map((doc) => doc.id);
  }

  /**
   * Copy some or all forms in the collection to `dest`.
   *
   * `FirestoreStoryForm`s are transformed by `transformer` before being written
   * to `dest`.
   */
  async copy(
    dest: FirestoreStoryForms,
    transformer: (form: FirestoreStoryForm) => FirestoreDocument,
    params?: {
      ids?: string[] | undefined;
    }
  ): Promise<void> {
    const forms = await this.get(params);
    const firestoreForms = await this.storyFormsToFirestore(forms);

    const raw = transformItems(firestoreForms, transformer);
    await dumpToCollection(dest, raw);
  }

  private async storyFormsToFirestore(
    forms: Map<string, StoryForm>
  ): Promise<Map<string, FirestoreStoryForm>> {
    const availableQuestions = await this.questionReader.get();

    const entries = Array.from(forms.entries()).map(
      ([key, form]) =>
        [key, storyFormToFirestore(form, availableQuestions)] as [
          string,
          FirestoreStoryForm
        ]
    );
    return new Map(entries);
  }

  formsRef(): CollectionReference {
    return this.firestore.collection(this.collectionPath);
  }

  formRef(formId: string): DocumentReference {
    return this.formsRef().doc(formId);
  }
}
