import { readFile } from "fs/promises";

import { test } from "@jest/globals";

import { StoryChoice } from "../../src/story/story_choice";
import { Question } from "../../src/story/question";

test("Can create a Question", async () => {
  const image = await readFile("test/story/data/choice.jpg");

  new Question("toBeOrNot", "To be or not to be?", [
    new StoryChoice("yes", "Yes", image),
    new StoryChoice("no", "No", image),
  ]);
});
