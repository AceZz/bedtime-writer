import { expect, test } from "@jest/globals";
import { YAMLQuestionReader } from "../../../src/story/reader";
import { StoryQuestion } from "../../../src/story/story_question";
import { StoryChoice } from "../../../src/story/story_choice";

test("read questions", async () => {
  const reader = new YAMLQuestionReader("test/story/data/questions.yaml");

  const result = await reader.read();
  const expected = [
    new StoryQuestion("characterName", "Who is the hero of tonight's story?", [
      await StoryChoice.fromImagePath(
        "blaze",
        "Blaze, the kind dragon",
        "test/story/data/choice.jpg"
      ),
      await StoryChoice.fromImagePath(
        "sparkles",
        "Sparkles, the magical horse",
        "test/story/data/choice.jpg"
      ),
      await StoryChoice.fromImagePath(
        "frosty",
        "Frosty, the pinguin",
        "test/story/data/choice.jpg"
      ),
    ]),
    new StoryQuestion("characterFlaw", "What flaw does the hero have?", [
      await StoryChoice.fromImagePath(
        "failure",
        "Being afraid of failure",
        "test/story/data/choice.jpg"
      ),
      await StoryChoice.fromImagePath(
        "selfConfidence",
        "Lacking self-confidence",
        "test/story/data/choice.jpg"
      ),
      await StoryChoice.fromImagePath(
        "lazy",
        "Being a bit lazy",
        "test/story/data/choice.jpg"
      ),
      await StoryChoice.fromImagePath(
        "giveUp",
        "Giving up easily",
        "test/story/data/choice.jpg"
      ),
      await StoryChoice.fromImagePath(
        "noAdvice",
        "Not listening to advice",
        "test/story/data/choice.jpg"
      ),
    ]),
  ];

  expect(result).toStrictEqual(expected);
});
