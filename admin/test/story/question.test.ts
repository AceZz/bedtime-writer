import { readFile } from "fs/promises";

import { test } from "@jest/globals";

import { Choice } from "../../src/story/choice";
import { Question } from "../../src/story/question";

test("Can create a Question", async () => {
  const image = await readFile("test/story/data/choice.jpg");

  new Question("toBeOrNot", "To be or not to be?", [
    new Choice("yes", "Yes", image),
    new Choice("no", "No", image),
  ]);
});
