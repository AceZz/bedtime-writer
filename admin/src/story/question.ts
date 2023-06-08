import { Choice } from "./choice";

/**
 * A question of a story.
 */
export class Question {
  constructor(
    readonly id: string,
    readonly text: string,
    readonly choices: Choice[]
  ) {}
}
