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

export const DUMMY_QUESTIONS = [
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

export const DUMMY_QUESTIONS_0 = [
  DUMMY_QUESTIONS[0].copyWithChoices(["choice1", "choice2"]),
  DUMMY_QUESTIONS[1],
];

export const DUMMY_QUESTIONS_1 = [
  DUMMY_QUESTIONS[0].copyWithChoices(["choice1", "choice3"]),
  DUMMY_QUESTIONS[2],
];

/**
 * These questions should be used to generate StoryForms.
 */
export const REAL_QUESTIONS = [
  new StoryQuestion(
    "characterNameV1",
    "characterName",
    "Who is the hero of tonight's story?",
    0,
    new Date(2023, 7, 15),
    dummyStoryChoices(["blaze", "frosty", "sparkles"])
  ),
  new StoryQuestion(
    "characterChallengeV1",
    "characterChallenge",
    "What challenge awaits the hero?",
    1,
    new Date(2023, 7, 10),
    dummyStoryChoices(["animal", "friend", "lost", "riddle", "witch"])
  ),
  new StoryQuestion(
    "characterFlawV1",
    "characterFlaw",
    "What flaw does the hero have?",
    1,
    new Date(2023, 6, 10),
    dummyStoryChoices([
      "failure",
      "giveUp",
      "lazy",
      "noAdvice",
      "selfConfidence",
    ])
  ),
  new StoryQuestion(
    "characterPowerV1",
    "characterPower",
    "What Power does the hero have?",
    1,
    new Date(2023, 6, 10),
    dummyStoryChoices([
      "animals",
      "fly",
      "heal",
      "invisible",
      "minds",
      "weather",
    ])
  ),
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
