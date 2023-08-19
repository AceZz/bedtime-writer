import { Writer } from "./writer";
import { StoryForm } from "../story_form";
import {
  FirestoreStoryForms,
  FirestoreStoryQuestions,
} from "../../../firebase";
import { FirebaseQuestionReader, Reader } from "../reader";
import { StoryQuestion } from "../story_question";
import { listToMapById } from "../../../utils";

/**
 * This class writes a Form object to Firebase.
 *
 */
export class FirebaseFormWriter implements Writer<StoryForm> {
  private questionReader: Reader<StoryQuestion[]>;

  constructor(
    private readonly formsCollection: FirestoreStoryForms,
    questionsCollection: FirestoreStoryQuestions
  ) {
    this.questionReader = new FirebaseQuestionReader(questionsCollection);
  }

  async write(form: StoryForm): Promise<void> {
    const availableQuestions = await this.getQuestions();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {};

    // Check and write the start date.
    data.start = form.start;

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
          `FirebaseFormWriter.write: question "${formQuestion.id}" ` +
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
    return listToMapById(await this.questionReader.read());
  }
}
