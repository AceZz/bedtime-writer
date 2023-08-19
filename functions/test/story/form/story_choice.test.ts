import { mkdir, readFile, writeFile } from "node:fs/promises";

import { beforeAll, expect, test } from "@jest/globals";
import { StoryChoice } from "../../../src/story";

const OUTPUT_FOLDER = "test/output";

beforeAll(async () => {
  await mkdir(OUTPUT_FOLDER, { recursive: true });
});

test("Can create a Choice", async () => {
  const image = await readFile("test/story/data/choice.jpg");
  new StoryChoice("yesNo", "Yes and no", "Both yes and no.", image);
});

test("toString", async () => {
  const choice = new StoryChoice(
    "choice0",
    "Text for choice0",
    "Prompt for choice0",
    Buffer.from("")
  );

  expect(choice.toString()).toBe("Text for choice0");
});

test("StoryChoice.fromImagePath", async () => {
  const choice = await StoryChoice.fromImagePath(
    "yesNo",
    "Yes and no",
    "Both yes and no.",
    "test/story/data/choice.jpg"
  );

  const OUTPUT_PATH = `${OUTPUT_FOLDER}/Choice_image.png`;
  await writeFile(OUTPUT_PATH, choice.image);
  console.log(`StoryChoice.fromImagePath: image saved at ${OUTPUT_PATH}`);
});
