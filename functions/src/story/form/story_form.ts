import { cartesianProduct } from "../../../src/utils";

/**
 * Stores questions and choices that should be displayed to the user.
 *
 * `questionsToChoices` maps a question ID to its choices IDs.
 */
export class StoryForm {
  readonly start: Date;

  constructor(
    readonly questionsToChoices: Map<string, string[]>,
    start?: Date
  ) {
    this.start = start ?? new Date();
  }

  static getAllFormResponses(questionsToChoices: Map<string, string[]>): {
    questions: string[];
    formResponses: string[][];
  } {
    const questions = Array.from(questionsToChoices.keys());
    const choices = Array.from(questionsToChoices.values());

    const formResponses = cartesianProduct(choices);
    return { questions: questions, formResponses: formResponses };
  }

  getAllFormResponses(): {
    questions: string[];
    formResponses: string[][];
  } {
    return StoryForm.getAllFormResponses(this.questionsToChoices);
  }
}
