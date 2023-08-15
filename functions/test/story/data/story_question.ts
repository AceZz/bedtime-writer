import { StoryChoice, StoryQuestion } from "../../../src/story";

/**
 * Quickly generate an array of dummy StoryChoices.
 */
export async function dummyStoryChoices(ids: string[]): Promise<StoryChoice[]> {
  return Promise.all(ids.map((id) => dummyStoryChoice(id)));
}

/**
 * Quickly generate a dummy StoryChoice.
 */
export async function dummyStoryChoice(id: string): Promise<StoryChoice> {
  return new StoryChoice(
    id,
    `Text for ${id}`,
    `Prompt for ${id}`,
    Buffer.from("")
  );
}

export const ALL_QUESTIONS = async () => [
  new StoryQuestion(
    "question1V1",
    "question1",
    "Question 1",
    0,
    new Date(2023, 7, 15),
    await dummyStoryChoices(["choice1", "choice2", "choice3"])
  ),
  new StoryQuestion(
    "question2V1",
    "question2",
    "Question 2",
    1,
    new Date(2023, 7, 10),
    await dummyStoryChoices(["choice1", "choice2"])
  ),
  new StoryQuestion(
    "question3V1",
    "question3",
    "Question 3",
    1,
    new Date(2023, 6, 10),
    await dummyStoryChoices(["choice1", "choice2"])
  ),
];

export async function QUESTIONS_0() {
  const allQuestions = await ALL_QUESTIONS();
  return [
    allQuestions[0].copyWithChoices(["choice1", "choice2"]),
    allQuestions[1],
  ];
}

export async function QUESTIONS_1() {
  const allQuestions = await ALL_QUESTIONS();
  return [
    allQuestions[0].copyWithChoices(["choice1", "choice3"]),
    allQuestions[2],
  ];
}

export const QUESTIONS_CHARACTER = async () => [
  new StoryQuestion(
    "characterNameV1",
    "characterName",
    "What is the character name?",
    0,
    new Date(2023, 7, 15),
    await dummyStoryChoices(["name0", "name1"])
  ),
  new StoryQuestion(
    "characterFlawV1",
    "characterFlaw",
    "What is the character flaw?",
    1,
    new Date(2023, 7, 15),
    await dummyStoryChoices(["flaw0"])
  ),
];
