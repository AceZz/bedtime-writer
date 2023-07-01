import { readFile } from "fs/promises";

import { test } from "@jest/globals";

import { StoryChoice } from "../../src/story/story_choice";
import { StoryQuestion } from "../../src/story/story_question";

test("Can create a StoryQuestion", async () => {
  const image = await readFile("test/story/data/choice.jpg");

  new StoryQuestion("toBeOrNot", "To be or not to be?", [
    new StoryChoice("yes", "Yes", image),
    new StoryChoice("no", "No", image),
  ]);
});
