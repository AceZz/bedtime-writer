import { listToMapById } from "../../utils";
import { StoryChoice } from "./story_choice";

/**
 * A question of a story.
 */
export class StoryQuestion {
  readonly choices: Map<string, StoryChoice>;

  constructor(
    readonly id: string,
    readonly promptParam: string,
    readonly text: string,
    readonly priority: number,
    readonly createdAt: Date,
    choices: StoryChoice[]
  ) {
    this.choices = listToMapById(choices);
  }

  toString(): string {
    return `${this.text} (${this.id})\n  * ${Array.from(this.choices.values())
      .map((choice) => choice.toString())
      .join("\n  * ")}`;
  }

  fullId(): string {
    return `${this.id}:${this.choiceIds.join(",")}`;
  }

  get choiceIds(): string[] {
    return Array.from(this.choices.keys());
  }

  /**
   * Return a copy of this with choices filtered to those in `choiceIds`.
   */
  copyWithChoices(choiceIds: Iterable<string>): StoryQuestion {
    const choiceIdsNotFound = [];
    const newChoices = [];

    for (const choiceId of choiceIds) {
      const choice = this.choices.get(choiceId);

      if (choice === undefined) {
        choiceIdsNotFound.push(choiceId);
      } else {
        newChoices.push(choice);
      }
    }

    if (choiceIdsNotFound.length !== 0) {
      throw Error(
        "StoryQuestion.copyWithChoices: invalid choice IDs " +
          `provided: ${choiceIdsNotFound}`
      );
    }

    return new StoryQuestion(
      this.id,
      this.promptParam,
      this.text,
      this.priority,
      this.createdAt,
      newChoices
    );
  }

  /**
   * Sort `questions` per `createdAt` in place.
   */
  static sortMostRecentFirst(questions: StoryQuestion[]): void {
    questions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Sort `questions` per `priority` (lowest first) in place.
   */
  static sortPriority(questions: StoryQuestion[]): void {
    questions.sort((a, b) => a.priority - b.priority);
  }
}
