import { StoryChoice, StoryQuestion } from "../../../src/story";

/**
 * Quickly generate an array of dummy StoryChoices.
 */
export function dummyStoryChoices(ids: string[]): StoryChoice[] {
  return ids.map((id) => dummyStoryChoice(id));
}

/**
 * Quickly generate a dummy StoryChoice.
 */
export function dummyStoryChoice(id: string): StoryChoice {
  return new StoryChoice(
    id,
    `Text for ${id}`,
    `Prompt for ${id}`,
    Buffer.from("")
  );
}

export const ALL_QUESTIONS = [
  new StoryQuestion(
    "question1V1",
    "question1",
    "Question 1",
    0,
    new Date(2023, 7, 15),
    dummyStoryChoices(["choice1", "choice2", "choice3"])
  ),
  new StoryQuestion(
    "question2V1",
    "question2",
    "Question 2",
    1,
    new Date(2023, 7, 10),
    dummyStoryChoices(["choice1", "choice2"])
  ),
  new StoryQuestion(
    "question3V1",
    "question3",
    "Question 3",
    1,
    new Date(2023, 6, 10),
    dummyStoryChoices(["choice1", "choice2"])
  ),
];

export const QUESTIONS_0 = [
  ALL_QUESTIONS[0].copyWithChoices(["choice1", "choice2"]),
  ALL_QUESTIONS[1],
];

export const QUESTIONS_1 = [
  ALL_QUESTIONS[0].copyWithChoices(["choice1", "choice3"]),
  ALL_QUESTIONS[2],
];

export const QUESTIONS_CHARACTER = [
  new StoryQuestion(
    "characterNameV1",
    "characterName",
    "What is the character name?",
    0,
    new Date(2023, 7, 15),
    dummyStoryChoices(["name0", "name1"])
  ),
  new StoryQuestion(
    "characterFlawV1",
    "characterFlaw",
    "What is the character flaw?",
    1,
    new Date(2023, 7, 15),
    dummyStoryChoices(["flaw0"])
  ),
];
