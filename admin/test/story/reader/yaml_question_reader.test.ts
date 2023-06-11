import { expect, test } from "@jest/globals";
import { YAMLQuestionReader } from "../../../src/story/reader/yaml_question_reader";
import { Question } from "../../../src/story/question";
import { Choice } from "../../../src/story/choice";

test("read questions", async () => {
  const reader = new YAMLQuestionReader("test/story/data/questions.yaml");

  const result = await reader.read();
  const expected = [
    new Question("character", "Who is the hero of tonight's story?", [
      await Choice.fromImagePath(
        "blaze",
        "Blaze, the kind dragon",
        "test/story/data/choice.jpg"
      ),
      await Choice.fromImagePath(
        "sparkles",
        "Sparkles, the magical horse",
        "test/story/data/choice.jpg"
      ),
      await Choice.fromImagePath(
        "frosty",
        "Frosty, the pinguin",
        "test/story/data/choice.jpg"
      ),
    ]),
    new Question("flaw", "What flaw does the hero have?", [
      await Choice.fromImagePath(
        "failure",
        "Being afraid of failure",
        "test/story/data/choice.jpg"
      ),
      await Choice.fromImagePath(
        "selfConfidence",
        "Lacking self-confidence",
        "test/story/data/choice.jpg"
      ),
      await Choice.fromImagePath(
        "lazy",
        "Being a bit lazy",
        "test/story/data/choice.jpg"
      ),
      await Choice.fromImagePath(
        "giveUp",
        "Giving up easily",
        "test/story/data/choice.jpg"
      ),
      await Choice.fromImagePath(
        "noAdvice",
        "Not listening to advice",
        "test/story/data/choice.jpg"
      ),
    ]),
  ];

  expect(result).toStrictEqual(expected);
});
