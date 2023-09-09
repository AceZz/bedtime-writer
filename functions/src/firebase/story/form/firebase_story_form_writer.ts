import {
  StoryFormWriter,
  StoryForm,
  StoryQuestionReader,
  StoryReader,
} from "../../../story/";
import { FirestoreStoryForms } from "./firestore_story_forms";

/**
 * This class writes a Form object to Firebase.
 *
 */
export class FirebaseStoryFormWriter implements StoryFormWriter {
  constructor(
    private readonly formsCollection: FirestoreStoryForms,
    private readonly questionReader?: StoryQuestionReader,
    private readonly storyReader?: StoryReader
  ) {}

  async write(form: StoryForm): Promise<string> {
    if (this.questionReader === undefined)
      throw new Error("write: no question reader specified.");
    const availableQuestions = await this.questionReader.get();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {};

    // Check and write the datetime.
    data.datetime = form.datetime;

    // Check and write the questions.
    let index = 0;
    for (const formQuestion of form.questions.values()) {
      // Try to copy the existing question with the choices from the form. The
      // choices are verified by `copyWithChoices`.
      const validatedQuestion = availableQuestions
        .get(formQuestion.id)
        ?.copyWithChoices(formQuestion.choices.keys());

      if (validatedQuestion === undefined) {
        throw Error(
          `FirebaseStoryFormWriter.write: question "${formQuestion.id}" ` +
            "does not exist."
        );
      }

      data[`question${index}`] = formQuestion.id;
      data[`question${index}Choices`] = formQuestion.choiceIds;
      index++;
    }
    data.numQuestions = index;
    data.isCached = false;
    data.isApproved = false;

    const doc = await this.formsCollection.formsRef().add(data);
    return doc.id;
  }

  async writeIsCached(id: string): Promise<void> {
    await this.formsCollection.formRef(id).update({ isCached: true });
  }

  async approveForm(id: string): Promise<void> {
    if (this.storyReader === undefined) {
      throw new Error(
        "approveForm: no story reader specified. Please provide a StoryReader when instantiating FirebaseStoryFormWriter."
      );
    }

    const isAllFormImagesApproved =
      await this.storyReader.checkAllFormImagesApproved(id);

    if (!isAllFormImagesApproved) {
      throw new Error(
        `approveForm: form ${id} cannot be approved as some images in the stories collection are still not approved.`
      );
    }

    await this.writeIsApproved(id);
  }

  private async writeIsApproved(id: string): Promise<void> {
    await this.formsCollection.formRef(id).update({ isApproved: true });
  }
}
