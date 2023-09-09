import {
  StoryForm,
  StoryFormReader,
  StoryQuestion,
  StoryQuestionReader,
} from "../../../story";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { FirestoreStoryForms } from "./firestore_story_forms";
import { listToMapById } from "../../../utils";

/**
 * Read a list of Forms from Firebase.
 */
export class FirebaseStoryFormReader implements StoryFormReader {
  constructor(
    private readonly formsCollection: FirestoreStoryForms,
    private readonly questionReader: StoryQuestionReader | undefined = undefined
  ) {}

  async readAll(): Promise<StoryForm[]> {
    const questions = await this.readQuestions();

    const snapshots = await this.formsCollection.formsRef().get();
    return Promise.all(
      snapshots.docs.map((snapshot) => this.readForm(snapshot, questions))
    );
  }

  async readNotCached(): Promise<StoryForm[]> {
    return Array.from((await this.readNotCachedWithIds()).values());
  }

  async readNotCachedWithIds(): Promise<Map<string, StoryForm>> {
    const questions = await this.readQuestions();

    const snapshots = await this.formsCollection
      .formsRef()
      .where("isCached", "==", false)
      .get();

    return new Map(
      await Promise.all(
        snapshots.docs.map(
          (doc) =>
            // Get a list of `[storyFormId, storyForm]`, and pass it to `Map`.
            [doc.id, this.readForm(doc, questions)] as [string, StoryForm]
        )
      )
    );
  }

  async readNotApprovedIds(): Promise<string[]> {
    const snapshots = await this.formsCollection
      .formsRef()
      .where("isApproved", "==", false)
      .get();

    return snapshots.docs.map((doc) => doc.id);
  }

  async readQuestions(): Promise<Map<string, StoryQuestion>> {
    if (this.questionReader === undefined) {
      throw new Error(
        "readQuestions: no question reader specified. Please provide a StoryQuestionReader when instantiating FirebaseStoryFormReader."
      );
    }

    return listToMapById(await this.questionReader.readAll());
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
}
