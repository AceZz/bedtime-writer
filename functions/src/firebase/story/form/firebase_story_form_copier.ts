import { Copier, CopierFilter, CopierParams, StoryForm } from "../../../story";
import { FirestoreDocument, dumpToCollection } from "../../firestore_utils";
import { storyFormToFirestore } from "./firebase_story_form_writer";
import {
  FirestoreStoryForm,
  FirestoreStoryForms,
} from "./firestore_story_forms";
import { FirestoreStoryQuestions } from "./firestore_story_questions";

export class FirebaseStoryFormCopier extends Copier<
  FirestoreStoryForm,
  FirestoreDocument
> {
  constructor(
    protected readonly itemFilter: CopierFilter<
      FirestoreStoryForm,
      FirestoreDocument
    >,
    private readonly originQuestions: FirestoreStoryQuestions,
    private readonly originForms: FirestoreStoryForms,
    private readonly dest: FirestoreStoryForms
  ) {
    super();
  }

  async copy(params?: CopierParams | undefined): Promise<void> {
    const forms = await this.originForms.get(params);
    const firestoreForms = await this.storyFormsToFirestore(forms);

    const raw = this.filterItems(firestoreForms);
    await dumpToCollection(this.dest, raw);
  }

  private async storyFormsToFirestore(
    forms: Map<string, StoryForm>
  ): Promise<Map<string, FirestoreStoryForm>> {
    const availableQuestions = await this.originQuestions.get();

    const entries = Array.from(forms.entries()).map(
      ([key, form]) =>
        [key, storyFormToFirestore(form, availableQuestions)] as [
          string,
          FirestoreStoryForm
        ]
    );
    return new Map(entries);
  }
}
