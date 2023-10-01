import { combinations } from "../../../utils";
import { StoryQuestion } from "../story_question";

/**
 * Given a `baseQuestion`, yield all the `StoryQuestion`s obtained from the
 * combinations of `numChoices` choices (what we call "variations").
 *
 * Note: if this looks confusing, think that `baseQuestion` may have _many_
 *   choices, but each yielded `StoryQuestion` only has `numChoices` of them.
 *   This generator yields all possible combinations in a random order.
 */
export function* iterQuestionsVariations(
  baseQuestion: StoryQuestion,
  numChoices: number
): Generator<StoryQuestion> {
  for (const choiceIds of combinations(numChoices, baseQuestion.choiceIds)) {
    yield baseQuestion.copyWithChoices(choiceIds);
  }
}
