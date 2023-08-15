import { Writer } from "./writer";
import { StoryForm } from "../story_form";
import {
  FirestoreStoryForms,
  FirestoreStoryQuestions,
} from "../../../firebase";
import { FirebaseQuestionReader, FirebaseFormReader, Reader } from "../reader";
import { StoryQuestion } from "../story_question";
import { listToMapById } from "../../../utils";

/**
 * This class writes a Form object to Firebase.
 *
 */
export class FirebaseFormWriter implements Writer<StoryForm> {
  private formReader: Reader<StoryForm[]>;
  private questionReader: Reader<StoryQuestion[]>;

  constructor(
    private readonly formsCollection: FirestoreStoryForms,
    questionsCollection: FirestoreStoryQuestions
  ) {
    this.formReader = new FirebaseFormReader(
      formsCollection,
      questionsCollection
    );
    this.questionReader = new FirebaseQuestionReader(questionsCollection);
  }

  async write(form: StoryForm): Promise<void> {
    const availableQuestions = await this.getQuestions();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {};

    // Check and write the start date.
    await this.checkStart(form.start);
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

  private async checkStart(start: Date): Promise<void> {
    const mostRecentStart = await this.getMostRecentStart();
    if (mostRecentStart >= start) {
      throw Error(
        `This form starts at ${start}, but another form starts before at ` +
          `${mostRecentStart}.`
      );
    }
  }

  private async getMostRecentStart(): Promise<Date> {
    const forms = await this.formReader.read();
    const starts = forms.map((form) => form.start);
    starts.sort((a, b) => a.getTime() - b.getTime());

    return starts.at(-1) ?? new Date(2000, 0);
  }
}
