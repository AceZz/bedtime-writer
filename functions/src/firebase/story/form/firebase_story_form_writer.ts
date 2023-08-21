import { listToMapById } from "../../../utils";
import {
  StoryFormWriter,
  StoryForm,
  StoryQuestion,
  StoryQuestionReader,
} from "../../../story/";
import { FirestoreStoryForms } from "./firestore_story_forms";

/**
 * This class writes a Form object to Firebase.
 *
 */
export class FirebaseStoryFormWriter implements StoryFormWriter {
  constructor(
    private readonly formsCollection: FirestoreStoryForms,
    private readonly questionReader: StoryQuestionReader
  ) {}

  async write(form: StoryForm): Promise<void> {
    const availableQuestions = await this.getQuestions();

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

    await this.formsCollection.formsRef().add(data);
  }

  private async getQuestions(): Promise<Map<string, StoryQuestion>> {
    return listToMapById(await this.questionReader.readAll());
  }
}
