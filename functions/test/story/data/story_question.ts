import { StoryChoice, StoryQuestion } from "../../../src/story";

export const QUESTIONS_0 = async () => [
  new StoryQuestion("question1V1", "question1", "Question 1", 0, new Date(), [
    await StoryChoice.fromImagePath(
      "choice1",
      "Choice 1",
      "This is choice 1.",
      "test/story/data/choice.jpg"
    ),
    await StoryChoice.fromImagePath(
      "choice2",
      "Choice 2",
      "This is choice 2.",
      "test/story/data/choice.jpg"
    ),
  ]),
  new StoryQuestion("question2V1", "question2", "Question 2", 1, new Date(), [
    await StoryChoice.fromImagePath(
      "choice1",
      "Choice 1",
      "This is choice 1.",
      "test/story/data/choice.jpg"
    ),
    await StoryChoice.fromImagePath(
      "choice2",
      "Choice 2",
      "This is choice 2.",
      "test/story/data/choice.jpg"
    ),
  ]),
];

// same as `questions_0`, but:
// * `question_1` has another text, one of its choices was modified, one of its
//   choices was replaced by another
// * `question2` was replaced by `question3`

export const QUESTIONS_1 = async () => [
  new StoryQuestion(
    "question1V1",
    "question1",
    "New question 1",
    0,
    new Date(),
    [
      await StoryChoice.fromImagePath(
        "choice1",
        "New choice 1",
        "This is choice 1.",
        "test/story/data/choice.jpg"
      ),
      await StoryChoice.fromImagePath(
        "choice3",
        "Choice 3",
        "This is choice 3.",
        "test/story/data/choice.jpg"
      ),
    ]
  ),
  new StoryQuestion("question3V1", "question3", "Question 3", 1, new Date(), [
    await StoryChoice.fromImagePath(
      "choice1",
      "Choice 1",
      "This is choice 1.",
      "test/story/data/choice.jpg"
    ),
    await StoryChoice.fromImagePath(
      "choice2",
      "Choice 2",
      "This is choice 2.",
      "test/story/data/choice.jpg"
    ),
  ]),
];

export const QUESTIONS_CHARACTER = async () => [
  new StoryQuestion(
    "characterNameV1",
    "characterName",
    "What is the character name?",
    0,
    new Date(2023, 7, 15),
    [
      await StoryChoice.fromImagePath(
        "name0",
        "New name 0",
        "This is name0.",
        "test/story/data/choice.jpg"
      ),
      await StoryChoice.fromImagePath(
        "name1",
        "New name 1",
        "This is name1.",
        "test/story/data/choice.jpg"
      ),
    ]
  ),
  new StoryQuestion(
    "characterFlawV1",
    "characterFlaw",
    "What is the character flaw?",
    1,
    new Date(2023, 7, 15),
    [
      await StoryChoice.fromImagePath(
        "flaw0",
        "New flaw 0",
        "This is flaw0.",
        "test/story/data/choice.jpg"
      ),
    ]
  ),
];
