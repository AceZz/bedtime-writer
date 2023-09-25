import {
  StoryFormWriter,
  StoryForm,
  StoryQuestionReader,
  StoryReader,
  StoryQuestion,
} from "../../../story/";
import { FirestoreStoryForms } from "./firestore_story_forms";

/**
 * Transform a `StoryForm` into the object to insert into Firestore.
 */
export function storyFormToFirestore(
  form: StoryForm,
  availableQuestions: Map<string, StoryQuestion>
): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = {};

  // Check and write the creation time.
  data.createdAt = form.createdAt;

  // Check and write the questions.
  let index = 0;
  for (const formQuestion of form.questions.values()) {
    // Try to copy the existing question with the choices from the form. The
    // choices are verified by `copyWithChoices`.
    const validatedQuestion = availableQuestions
      .get(formQuestion.id)
      ?.copyWithChoices(formQuestion.choices.keys());

    if (validatedQuestion === undefined) {
      throw new Error(
        `storyFormToFirestore: question "${formQuestion.id}" does not exist.`
      );
    }

    data[`question${index}`] = formQuestion.id;
    data[`question${index}Choices`] = formQuestion.choiceIds;
    index++;
  }
  data.numQuestions = index;
  data.isCached = false;
  data.isApproved = false;

  return data;
}

/**
 * This class writes a Form object to Firebase.
 *
 */
export class FirebaseStoryFormWriter implements StoryFormWriter {
  constructor(
    private readonly formsCollection: FirestoreStoryForms,
    private readonly _questionReader?: StoryQuestionReader,
    private readonly _storyReader?: StoryReader
  ) {}

  async write(form: StoryForm): Promise<string> {
    const availableQuestions = await this.questionReader.get();

    const data = storyFormToFirestore(form, availableQuestions);
    const doc = await this.formsCollection.formsRef().add(data);
    return doc.id;
  }

  async writeIsCached(id: string): Promise<void> {
    await this.formsCollection.formRef(id).update({ isCached: true });
  }

  async approveForm(id: string): Promise<void> {
    const isAllFormImagesApproved =
      await this.storyReader.checkAllFormImagesApproved(id);

    if (!isAllFormImagesApproved) {
      throw new Error(
        `approveForm: form ${id} cannot be approved as some images in the ` +
          "stories collection are still not approved."
      );
    }

    await this.writeIsApproved(id);
  }

  private async writeIsApproved(id: string): Promise<void> {
    await this.formsCollection.formRef(id).update({ isApproved: true });
  }

  private get questionReader(): StoryQuestionReader {
    if (this._questionReader === undefined)
      throw new Error(
        "FirebaseStoryFormWriter: specify a `StoryQuestionReader`" +
          "in the constructor."
      );
    return this._questionReader;
  }

  private get storyReader(): StoryReader {
    if (this._storyReader === undefined)
      throw new Error(
        "FirebaseStoryFormWriter: specify a `StoryReader`" +
          "in the constructor."
      );
    return this._storyReader;
  }
}
