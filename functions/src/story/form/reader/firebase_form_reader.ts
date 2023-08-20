import { StoryForm } from "../story_form";
import { Reader } from "./reader";
import {
  FirestoreStoryForms,
  FirestoreStoryQuestions,
} from "../../../firebase";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { FirebaseQuestionReader } from "./firebase_question_reader";
import { StoryQuestion } from "../story_question";
import { listToMapById } from "../../../utils";

/**
 * Read a list of Forms from Firebase.
 */
export class FirebaseFormReader implements Reader<StoryForm[]> {
  private readonly questionReader: FirebaseQuestionReader;

  constructor(
    private readonly formsCollection: FirestoreStoryForms,
    questionsCollection: FirestoreStoryQuestions
  ) {
    this.questionReader = new FirebaseQuestionReader(questionsCollection);
  }

  async read(): Promise<StoryForm[]> {
    const questions = await this.readQuestions();

    const snapshots = await this.formsCollection.formsRef().get();
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
    return listToMapById(await this.questionReader.read());
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
