import { cartesianProduct } from "../../src/utils";

/**
 * Stores questions and choices that should be displayed to the user.
 *
 * `questions` maps a question ID to choices IDs.
 */
export class StoryForm {
  readonly start: Date;

  constructor(
    readonly questionsToChoices: Map<string, string[]>,
    start?: Date
  ) {
    this.start = start ?? new Date();
  }

  getAllFormResponses(): {
    questions: string[];
    formResponses: string[][];
  } {
    const questions = Array.from(this.questionsToChoices.keys());
    const choices = Array.from(this.questionsToChoices.values());

    const formResponses = cartesianProduct(choices);
    return { questions: questions, formResponses: formResponses };
  }

  static getAllFormResponses(questionsToChoices: Map<string, string[]>): {
    questions: string[];
    formResponses: string[][];
  } {
    return new StoryForm(questionsToChoices).getAllFormResponses();
  }
}
