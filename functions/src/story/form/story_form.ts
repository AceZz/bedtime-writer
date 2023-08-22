import { cartesianProduct, listToMapById } from "../../../src/utils";
import { StoryChoice } from "./story_choice";
import { StoryQuestion } from "./story_question";

export class StoryFormAnswerError extends Error {}

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

  /**
   * Check that `answer` answers all the questions with valid choices.
   * Throw a `StoryFormAnswerError` if there is a validation error.
   */
  validateAnswer(answer: Map<string, string>): void {
    const missingQuestions = Array.from(this.questions.keys()).filter(
      (questionId) => !answer.has(questionId)
    );
    if (missingQuestions.length > 0) {
      throw new StoryFormAnswerError(
        `Missing questions: [${missingQuestions.join(", ")}].`
      );
    }

    const invalidQuestions = [];

    for (const [questionId, choiceId] of answer.entries()) {
      const question = this.questions.get(questionId);

      if (question === undefined) {
        invalidQuestions.push(questionId);
      } else {
        const choice = question.choices.get(choiceId);
        if (choice === undefined) {
          throw new StoryFormAnswerError(
            `Invalid choice for question ${questionId}: ${choiceId}.`
          );
        }
      }
    }

    if (invalidQuestions.length > 0) {
      throw new StoryFormAnswerError(
        `Invalid questions: [${invalidQuestions.join(", ")}].`
      );
    }
  }
}
