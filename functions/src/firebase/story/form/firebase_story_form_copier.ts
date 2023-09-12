import { Copier, CopierFilter, CopierParams, StoryForm } from "../../../story";
import { dumpToCollection } from "../../firestore_utils";
import { FirebaseStoryFormReader } from "./firebase_story_form_reader";
import { storyFormToFirestore } from "./firebase_story_form_writer";
import { FirestoreStoryForms } from "./firestore_story_forms";
import { FirestoreStoryQuestions } from "./firestore_story_questions";

export class FirebaseStoryFormCopier<
  T extends { [key: string]: any }
> extends Copier<any, T> {
  private formReader: FirebaseStoryFormReader;

  constructor(
    protected readonly itemFilter: CopierFilter<any, T>,
    private readonly originQuestions: FirestoreStoryQuestions,
    private readonly originForms: FirestoreStoryForms,
    private readonly dest: FirestoreStoryForms
  ) {
    super();
    this.formReader = new FirebaseStoryFormReader(
      this.originForms,
      this.originQuestions
    );
  }

  async copy(params?: CopierParams | undefined): Promise<void> {
    const forms = await this.formReader.get(params);
    const firestoreForms = await this.storyFormsToFirestore(forms);

    const raw = this.filterItems(firestoreForms);
    await dumpToCollection(this.dest, raw);
  }

  private async storyFormsToFirestore(
    forms: Map<string, StoryForm>
  ): Promise<Map<string, any>> {
    const availableQuestions = await this.originQuestions.get();

    const entries = Array.from(forms.entries()).map(([key, form]) => [
      key,
      storyFormToFirestore(form, availableQuestions),
    ]) as [string, any][];
    return new Map(entries);
  }
}
