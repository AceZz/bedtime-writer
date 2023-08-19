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
    readonly datetime: Date,
    choices: StoryChoice[]
  ) {
    this.choices = listToMapById(choices);
  }

  toString(): string {
    return `${this.text} (${this.id})\n  * ${Array.from(this.choices.values())
      .map((choice) => choice.toString())
      .join("\n  * ")}`;
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
      this.datetime,
      newChoices
    );
  }
}
