import {
  cartesianProduct,
  listToMapById,
  pickRandom,
} from "../../../src/utils";
import { ClassicStoryLogic } from "../logic";
import { StoryQuestion } from "./story_question";

export class StoryFormAnswerError extends Error {}

const DURATIONS = [3, 4, 5];
const STYLES = [
  "the Arabian Nights",
  "Hans Christian Andersen",
  "the Brothers Grimm",
  "Charles Perrault",
];

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

  getAllAnswers(): Map<string, string>[] {
    const questions = Array.from(this.questions.values());

    // choices[question_index][choice_index]
    const choices = questions.map((question) =>
      Array.from(question.choices.values())
    );

    // answers[answer_index][question_index]
    const answers = Array.from(cartesianProduct(choices));

    return answers.map((answer) => {
      const map = new Map<string, string>();
      for (const [questionIndex, choice] of answer.entries()) {
        map.set(questions[questionIndex].id, choice.id);
      }
      return map;
    });
  }

  /**
   * Transform `answer` into a classic `StoryLogic`.
   *
   * Throw a `StoryFormAnswerError` if there is a validation error.
   */
  toClassicLogic(answer: Map<string, string>): ClassicStoryLogic {
    this.validateAnswer(answer);
    const prompts = this.convertAnswer(answer);

    const duration = pickRandom(DURATIONS);
    const style = pickRandom(STYLES);

    const characterName = prompts.get("characterName");
    if (characterName === undefined) {
      throw new StoryFormAnswerError(
        "Missing questions from form: [characterName]"
      );
    }

    const logic = new ClassicStoryLogic(
      duration,
      style,
      characterName,
      prompts.get("place"),
      prompts.get("object"),
      prompts.get("characterFlaw"),
      prompts.get("characterPower"),
      prompts.get("characterChallenge")
    );

    if (!logic.isValid()) {
      throw new StoryFormAnswerError("Invalid logic");
    }

    return logic;
  }

  /**
   * Convert `answer`, which is a `Map` `StoryQuestion.id -> StoryChoice.id`,
   * to a `Map` `StoryQuestion.promptParam -> StoryChoice.prompt`.
   *
   * Assume that `answer` has already been validated.
   */
  private convertAnswer(answer: Map<string, string>): Map<string, string> {
    const map = new Map();

    for (const [questionId, choiceId] of answer.entries()) {
      const question = this.questions.get(questionId);
      if (question === undefined) {
        throw new Error(
          `convertAnswer: question ${questionId} does not exist.`
        );
      }

      const choice = question.choices.get(choiceId);
      if (choice === undefined) {
        throw new Error(
          `convertAnswer: question ${questionId} choice ${choiceId} ` +
            "does not exist."
        );
      }

      map.set(question.promptParam, choice.prompt);
    }

    return map;
  }

  /**
   * Check that `answer` answers all the questions with valid choices.
   *
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
