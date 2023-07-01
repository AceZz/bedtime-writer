import { StoryForm } from "../story_form";
import { Reader } from "./reader";
import { FirestoreStoryForms } from "../../firebase/firestore_story_forms";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { FirestorePaths } from "../../firebase/firestore_paths";

/**
 * Read a list of Forms from a Firestore collection.
 */
export class FirestoreFormReader implements Reader<StoryForm[]> {
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

  private readForm(snapshot: QueryDocumentSnapshot): StoryForm {
    const data = snapshot.data();

    const questions = new Map();
    for (const index of [...Array(data.numQuestions).keys()]) {
      questions.set(data[`question${index}`], data[`question${index}Choices`]);
    }

    return new StoryForm(questions, data.start.toDate());
  }
}
