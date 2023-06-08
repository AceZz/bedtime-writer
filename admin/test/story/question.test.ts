import { test } from "@jest/globals";

import { Choice } from "../../src/story/choice";
import { Question } from "../../src/story/question";

test("Can create a Question", () => {
  new Question("toBeOrNot", "To be or not to be?", [
    new Choice("yes", "Yes", "yes.png"),
    new Choice("no", "No", "no.png"),
  ]);
});
