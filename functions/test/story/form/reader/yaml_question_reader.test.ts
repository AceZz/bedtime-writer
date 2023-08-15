import { expect, test } from "@jest/globals";
import {
  StoryChoice,
  StoryQuestion,
  YAMLQuestionReader,
} from "../../../../src/story";

test("read questions", async () => {
  const reader = new YAMLQuestionReader("test/story/data/questions.yaml");

  const result = await reader.read();
  const expected = [
    new StoryQuestion(
      "characterNameV1",
      "characterName",
      "Who is the hero of tonight's story?",
      0,
      result[0].datetime, // Strict equality check prevents from testing datetime here
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
      result[1].datetime,
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
  expectDatetimeToRoughlyBeNow(result);
});

function expectDatetimeToRoughlyBeNow(questions: StoryQuestion[]): void {
  const now = new Date();
  const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds

  const lowerBound = new Date(now.getTime() - fiveMinutes);
  const upperBound = new Date(now.getTime() + fiveMinutes);

  questions.forEach((question) => {
    expect(question.datetime.getTime()).toBeGreaterThanOrEqual(
      lowerBound.getTime()
    );
    expect(question.datetime.getTime()).toBeLessThanOrEqual(
      upperBound.getTime()
    );
  });
}
