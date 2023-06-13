import { Form } from "../form";
import { Reader } from "./reader";
import { FirestoreStoryForms } from "../../firebase/firestore_story_forms";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";

/**
 * Read a list of Forms from a Firestore collection.
 */
export class FirestoreFormReader implements Reader<Form[]> {
  private collection: FirestoreStoryForms;

  constructor(collectionName?: string) {
    this.collection = new FirestoreStoryForms(collectionName);
  }

  async read(): Promise<Form[]> {
    const snapshots = await this.collection.formsRef().get();
    return Promise.all(
      snapshots.docs.map((snapshot) => this.readForm(snapshot))
    );
  }

  private readForm(snapshot: QueryDocumentSnapshot): Form {
    const data = snapshot.data();

    const questions = new Map();
    for (const index of [...Array(data.numQuestions).keys()]) {
      questions.set(data[`question${index}`], data[`question${index}Choices`]);
    }

    return new Form(questions, data.start.toDate());
  }
}
