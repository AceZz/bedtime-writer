import { cartesianProduct, listToMapById } from "../../../src/utils";
import { StoryChoice } from "./story_choice";
import { StoryQuestion } from "./story_question";

/**
 * Stores questions and choices that should be displayed to the user.
 *
 * `datetime` is the creation datetime.
 */
export class StoryForm {
  readonly datetime: Date;
  readonly questions: Map<string, StoryQuestion>;

  constructor(questions: StoryQuestion[], datetime?: Date) {
    this.questions = listToMapById(questions);
    this.datetime = datetime ?? new Date();
  }

  static getAllFormResponses(questions: Map<string, StoryQuestion>): {
    questions: StoryQuestion[];
    formResponses: StoryChoice[][];
  } {
    // List of questions.
    const questionsList = Array.from(questions.values());

    // choices[question_index][choice_index]
    const choices = questionsList.map((question) =>
      Array.from(question.choices.values())
    );

    // choices[item_index][question_index]
    const formResponses = Array.from(cartesianProduct(choices));

    return {
      questions: questionsList,
      formResponses: formResponses,
    };
  }

  toString(): string {
    return Array.from(this.questions.values())
      .map((question) => question.toString())
      .join("\n");
  }

  fullId(): string {
    return Array.from(this.questions.values())
      .map((question) => question.fullId())
      .join("|");
  }

  get questionIds(): string[] {
    return Array.from(this.questions.keys());
  }

  getAllFormResponses(): {
    questions: StoryQuestion[];
    formResponses: StoryChoice[][];
  } {
    return StoryForm.getAllFormResponses(this.questions);
  }
}
