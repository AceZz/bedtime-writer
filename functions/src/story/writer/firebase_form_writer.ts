import { DocumentReference } from "firebase-admin/firestore";

import { Writer } from "./writer";
import { StoryForm } from "../story_form";
import { FirestoreStoryForms } from "../../firebase/firestore_story_forms";
import { Reader } from "../reader/reader";
import { StoryQuestion } from "../story_question";
import { FirestoreQuestionReader } from "../reader/firestore_question_reader";
import { FirestoreFormReader } from "../reader/firestore_form_reader";
import { FirestorePaths } from "../../firebase/firestore_paths";

/**
 * This class writes a Form object to Firebase.
 *
 */
export class FirebaseFormWriter implements Writer<StoryForm> {
  private formsCollection: FirestoreStoryForms;
  private formReader: Reader<StoryForm[]>;
  private questionReader: Reader<StoryQuestion[]>;

  constructor(paths?: FirestorePaths) {
    this.formsCollection = new FirestoreStoryForms(paths);
    this.formReader = new FirestoreFormReader(paths);
    this.questionReader = new FirestoreQuestionReader(paths);
  }

  async write(form: StoryForm): Promise<void> {
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

    const formId = this.getFormId(data.start);
    await this.getDocRef(formId).set(data);
  }

  private getFormId(date: Date): string {
    const year = date.getUTCFullYear().toString();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0"); //Months start at 0
    const day = date.getUTCDate().toString().padStart(2, "0");
    return `${year}${month}${day}`;
  }

  private getDocRef(docId: string): DocumentReference {
    return this.formsCollection.formsRef().doc(docId);
  }

  private async getQuestions(): Promise<Map<string, StoryQuestion>> {
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
    questions: Map<string, StoryQuestion>
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
