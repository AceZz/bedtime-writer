import { StoryChoice } from "./story_choice";

/**
 * A question of a story.
 */
export class StoryQuestion {
  constructor(
    readonly id: string,
    readonly promptParam: string,
    readonly text: string,
    readonly choices: StoryChoice[]
  ) {}
}
