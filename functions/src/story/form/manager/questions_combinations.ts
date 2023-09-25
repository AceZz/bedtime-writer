import { sampleCombinations } from "../../../utils";
import { StoryQuestion } from "../story_question";

/**
 * Given a list of `StoryQuestion`s, choose the most recent per `promptParam`
 * and yield all `numQuestions`-combinations in a random order.
 *
 * If some questions are mandatory (priority = 0), they are in every yielded
 * combination. Every combination will be ordered by priority (lowest priority
 * first).
 *
 * Each yielded combination will typically be used to generate a `StoryForm`.
 */
export function* shuffleQuestionsCombinations(
  allQuestions: StoryQuestion[],
  numQuestions: number
): Generator<StoryQuestion[]> {
  const { mandatory, optional } = getQuestions(allQuestions);

  if (mandatory.length > numQuestions) {
    throw Error(
      "iterQuestions: " +
        `the number of mandatory questions (${mandatory.length}) is higher ` +
        `than the number of questions (${numQuestions}).`
    );
  }

  const optionalCombinations = sampleCombinations(
    undefined,
    numQuestions - mandatory.length,
    optional
  );

  for (const optionalQuestions of optionalCombinations) {
    const questions = [...mandatory, ...optionalQuestions];
    StoryQuestion.sortPriority(questions);
    yield questions;
  }
}

/**
 * Select the most recent questions grouped per `promptParam` and divide them
 * into two groups, mandatory and optional.
 */
export function getQuestions(allQuestions: StoryQuestion[]): {
  mandatory: StoryQuestion[];
  optional: StoryQuestion[];
} {
  const mandatory: StoryQuestion[] = [];
  const optional: StoryQuestion[] = [];

  for (const question of filterQuestions(allQuestions)) {
    if (question.priority === 0) mandatory.push(question);
    else optional.push(question);
  }

  return {
    mandatory,
    optional,
  };
}

/**
 * Return an Array of questions, one question per `promptParam`. For each
 * `promptParam`, the chosen question is the question which has the highest
 * createdAt.
 */
export function filterQuestions(
  allQuestions: StoryQuestion[]
): StoryQuestion[] {
  const filtered: StoryQuestion[] = [];

  for (const questions of groupQuestions(allQuestions).values()) {
    StoryQuestion.sortMostRecentFirst(questions);
    if (questions.length > 0) filtered.push(questions[0]);
  }

  return filtered;
}

/**
 * Return the questions grouped per `promptParam`.
 */
export function groupQuestions(
  allQuestions: StoryQuestion[]
): Map<string, StoryQuestion[]> {
  const map: Map<string, StoryQuestion[]> = new Map();

  for (const question of allQuestions) {
    const promptParam = question.promptParam;
    if (!map.has(promptParam)) map.set(promptParam, []);
    map.get(promptParam)?.push(question);
  }

  return map;
}
