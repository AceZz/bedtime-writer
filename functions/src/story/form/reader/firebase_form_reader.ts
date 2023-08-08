import { StoryForm } from "../story_form";
import { Reader } from "./reader";
import { FirestoreStoryForms, FirestorePaths } from "../../../firebase";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";

/**
 * Read a list of Forms from Firebase.
 */
export class FirebaseFormReader implements Reader<StoryForm[]> {
  private collection: FirestoreStoryForms;

  constructor(paths?: FirestorePaths) {
    this.collection = new FirestoreStoryForms(paths);
  }

  async read(): Promise<StoryForm[]> {
    const snapshots = await this.collection.formsRef().get();
    return Promise.all(
      snapshots.docs.map((snapshot) => this.readForm(snapshot))
    );
  }

  async readWithIds(): Promise<{ id: string; storyForm: StoryForm }[]> {
    const snapshots = await this.collection.formsRef().get();
    return Promise.all(
      snapshots.docs.map((snapshot) => {
        return { id: snapshot.id, storyForm: this.readForm(snapshot) };
      })
    );
  }

  async readMostRecentWithIds(
    n: number
  ): Promise<{ id: string; storyForm: StoryForm }[]> {
    const snapshots = await this.collection
      .formsRef()
      .orderBy("start", "desc")
      .limit(n)
      .get();
    return Promise.all(
      snapshots.docs.map((snapshot) => {
        return { id: snapshot.id, storyForm: this.readForm(snapshot) };
      })
    );
  }

  private readForm(snapshot: QueryDocumentSnapshot): StoryForm {
    const data = snapshot.data();

    const questions = new Map();
    for (const index of [...Array(data.numQuestions).keys()]) {
      questions.set(data[`question${index}`], data[`question${index}Choices`]);
    }

    return new StoryForm(questions, data.start.toDate());
  }
}