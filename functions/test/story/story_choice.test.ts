import { mkdir, readFile, writeFile } from "node:fs/promises";

import { beforeAll, test } from "@jest/globals";
import { StoryChoice } from "../../src/story";

const OUTPUT_FOLDER = "test/output";

beforeAll(async () => {
  await mkdir(OUTPUT_FOLDER, { recursive: true });
});

test("Can create a Choice", async () => {
  const image = await readFile("test/story/data/choice.jpg");
  new StoryChoice("yesNo", "Yes and no", image);
});

test("StoryChoice.fromImagePath", async () => {
  const choice = await StoryChoice.fromImagePath(
    "yesNo",
    "Yes and no",
    "test/story/data/choice.jpg"
  );

  const OUTPUT_PATH = `${OUTPUT_FOLDER}/Choice_image.png`;
  await writeFile(OUTPUT_PATH, choice.image);
  console.log(`StoryChoice.fromImagePath: image saved at ${OUTPUT_PATH}`);
});
