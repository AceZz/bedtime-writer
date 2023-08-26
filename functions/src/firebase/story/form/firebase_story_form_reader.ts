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
    private readonly questionReader: StoryQuestionReader
  ) {}

  async readAll(): Promise<StoryForm[]> {
    const questions = await this.readQuestions();

    const snapshots = await this.formsCollection.formsRef().get();
    return Promise.all(
      snapshots.docs.map((snapshot) => this.readForm(snapshot, questions))
    );
  }

  async readNotGenerated(): Promise<StoryForm[]> {
    const questions = await this.readQuestions();

    const snapshots = await this.formsCollection
      .formsRef()
      .where("isGenerated", "==", false)
      .get();
    return Promise.all(
      snapshots.docs.map((snapshot) => this.readForm(snapshot, questions))
    );
  }

  async readWithIds(): Promise<{ id: string; storyForm: StoryForm }[]> {
    const questions = await this.readQuestions();

    const snapshots = await this.formsCollection.formsRef().get();
    return Promise.all(
      snapshots.docs.map((snapshot) => {
        return {
          id: snapshot.id,
          storyForm: this.readForm(snapshot, questions),
        };
      })
    );
  }

  async readMostRecentWithIds(
    n: number
  ): Promise<{ id: string; storyForm: StoryForm }[]> {
    const questions = await this.readQuestions();

    const snapshots = await this.formsCollection
      .formsRef()
      .orderBy("datetime", "desc")
      .limit(n)
      .get();
    return Promise.all(
      snapshots.docs.map((snapshot) => {
        return {
          id: snapshot.id,
          storyForm: this.readForm(snapshot, questions),
        };
      })
    );
  }

  async readQuestions(): Promise<Map<string, StoryQuestion>> {
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
