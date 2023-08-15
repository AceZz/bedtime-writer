import { expect, test, jest } from "@jest/globals";
import {
  StoryChoice,
  StoryQuestion,
  YAMLQuestionReader,
} from "../../../../src/story";

test("read questions", async () => {
  jest.useFakeTimers().setSystemTime(new Date("2020-01-01"));

  const reader = new YAMLQuestionReader("test/story/data/questions.yaml");

  const result = await reader.read();
  const expected = [
    new StoryQuestion(
      "characterNameV1",
      "characterName",
      "Who is the hero of tonight's story?",
      0,
      new Date(),
      [
        await StoryChoice.fromImagePath(
          "blaze",
          "Blaze, the kind dragon",
          "The protagonist is Blaze, the kind dragon.",
          "test/story/data/choice.jpg"
        ),
        await StoryChoice.fromImagePath(
          "frosty",
          "Frosty, the penguin",
          "The protagonist is Frosty, the penguin.",
          "test/story/data/choice.jpg"
        ),
        await StoryChoice.fromImagePath(
          "sparkles",
          "Sparkles, the magical horse",
          "The protagonist is Sparkles, the magical horse.",
          "test/story/data/choice.jpg"
        ),
      ]
    ),
    new StoryQuestion(
      "characterFlawV1",
      "characterFlaw",
      "What flaw does the hero have?",
      1,
      new Date(),
      [
        await StoryChoice.fromImagePath(
          "failure",
          "Being afraid of failure",
          "The protagonist is afraid of failure.",
          "test/story/data/choice.jpg"
        ),
        await StoryChoice.fromImagePath(
          "giveUp",
          "Giving up easily",
          "The protagonist gives up easily.",
          "test/story/data/choice.jpg"
        ),
        await StoryChoice.fromImagePath(
          "lazy",
          "Being a bit lazy",
          "The protagonist is a bit lazy.",
          "test/story/data/choice.jpg"
        ),
        await StoryChoice.fromImagePath(
          "noAdvice",
          "Not listening to advice",
          "The protagonist does not listen to advice.",
          "test/story/data/choice.jpg"
        ),
        await StoryChoice.fromImagePath(
          "selfConfidence",
          "Lacking self-confidence",
          "The protagonist lacks self-confidence.",
          "test/story/data/choice.jpg"
        ),
      ]
    ),
  ];

  expect(result).toStrictEqual(expected);
});
