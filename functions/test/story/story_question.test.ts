import { readFile } from "fs/promises";

import { test } from "@jest/globals";

import { StoryChoice, StoryQuestion } from "../../src/story";

test("Can create a StoryQuestion", async () => {
  const image = await readFile("test/story/data/choice.jpg");

  new StoryQuestion("toBeOrNotV1", "toBeOrNot", "To be or not to be?", [
    new StoryChoice("yes", "Yes", "Yes to be.", image),
    new StoryChoice("no", "No", "No not be.", image),
  ]);
});
