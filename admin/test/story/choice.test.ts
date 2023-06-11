import { mkdir, readFile, writeFile } from "node:fs/promises";

import { beforeAll, test } from "@jest/globals";
import { Choice } from "../../src/story/choice";

const OUTPUT_FOLDER = "test/output";

beforeAll(async () => {
  await mkdir(OUTPUT_FOLDER, { recursive: true });
});

test("Can create a Choice", async () => {
  const image = await readFile("test/story/data/choice.jpg");
  new Choice("yesNo", "Yes and no", image);
});

test("Choice.fromImagePath", async () => {
  const choice = await Choice.fromImagePath(
    "yesNo",
    "Yes and no",
    "test/story/data/choice.jpg"
  );

  const OUTPUT_PATH = `${OUTPUT_FOLDER}/Choice_image.png`;
  await writeFile(OUTPUT_PATH, choice.image);
  console.log(`Choice.fromImagePath: image saved at ${OUTPUT_PATH}`);
});
