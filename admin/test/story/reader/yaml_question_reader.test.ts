import { expect, test } from "@jest/globals";
import { YAMLQuestionReader } from "../../../src/story/reader/yaml_question_reader";
import { Question } from "../../../src/story/question";
import { Choice } from "../../../src/story/choice";

test("read questions", async () => {
  const reader = new YAMLQuestionReader("test/story/data/questions.yaml");

  const result = await reader.read();
  const expected = [
    new Question("character", "Who is the hero of tonight's story?", [
      new Choice(
        "blaze",
        "Blaze, the kind dragon",
        "test/story/data/blaze.png"
      ),
      new Choice(
        "sparkles",
        "Sparkles, the magical horse",
        "test/story/data/sparkles.png"
      ),
      new Choice("frosty", "Frosty, the pinguin", "test/story/data/frosty.png"),
    ]),
    new Question("flaw", "What flaw does the hero have?", [
      new Choice(
        "failure",
        "Being afraid of failure",
        "test/story/data/failure.png"
      ),
      new Choice(
        "selfConfidence",
        "Lacking self-confidence",
        "test/story/data/self_confidence.png"
      ),
      new Choice("lazy", "Being a bit lazy", "test/story/data/lazy.png"),
      new Choice("giveUp", "Giving up easily", "test/story/data/give_up.png"),
      new Choice(
        "noAdvice",
        "Not listening to advice",
        "test/story/data/no_advice.png"
      ),
    ]),
  ];

  expect(result).toStrictEqual(expected);
});
