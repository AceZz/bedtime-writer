import { Writer } from "./writer";
import { Form } from "../form";
import { FirestoreForms } from "../firestore/firestore_forms";
import { Reader } from "../reader/reader";
import { Question } from "../question";
import { FirestoreQuestionReader } from "../reader/firestore_question_reader";
import { FirestoreFormReader } from "../reader/firestore_form_reader";

/**
 * This class writes a Form object to a Firestore database.
 *
 */
export class FirestoreFormWriter implements Writer<Form> {
  private formsCollection: FirestoreForms;
  private formReader: Reader<Form[]>;
  private questionReader: Reader<Question[]>;

  constructor(
    readonly formsCollectionName?: string,
    readonly questionsCollectionName?: string
  ) {
    this.formsCollection = new FirestoreForms(formsCollectionName);
    this.formReader = new FirestoreFormReader(formsCollectionName);
    this.questionReader = new FirestoreQuestionReader(questionsCollectionName);
  }

  async write(form: Form): Promise<void> {
    const questions = await this.getQuestions();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {};

    // Check and write the start date.
    await this.checkStart(form.start);
    data.start = form.start;

    // Check and write the questions.
    let index = 0;
    for (const [questionId, choices] of form.questions) {
      this.checkQuestionForm(questionId, choices, questions);

      data[`question${index}`] = questionId;
      data[`question${index}Choices`] = choices;
      index++;
    }
    data.numQuestions = index;

    await this.formsCollection.formsRef().add(data);
  }

  private async getQuestions(): Promise<Map<string, Question>> {
    const questions = new Map();

    const questionsList = await this.questionReader.read();
    questionsList.forEach((question) => questions.set(question.id, question));

    return questions;
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

  private checkQuestionForm(
    questionId: string,
    choiceIds: string[],
    questions: Map<string, Question>
  ) {
    const question = questions.get(questionId);
    if (question === undefined) {
      throw Error(`Question "${questionId}" does not exist.`);
    }

    const availableChoiceIds = question.choices.map((choice) => choice.id);
    for (const choiceId of choiceIds) {
      if (!availableChoiceIds.includes(choiceId)) {
        throw Error(
          `Choice "${choiceId}" for question "${questionId}" does not exist.`
        );
      }
    }
  }
}
