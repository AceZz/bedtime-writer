import { mkdir, writeFile } from "node:fs/promises";

import { beforeAll, test } from "@jest/globals";
import { Choice } from "../../src/story/choice";

const OUTPUT_FOLDER = "test/output";

beforeAll(async () => {
  await mkdir(OUTPUT_FOLDER, { recursive: true });
});

test("Can create a Choice", () => {
  new Choice("yesNo", "Yes and no", "some/path.png");
});

test("Choice.image()", async () => {
  const PATH = `${OUTPUT_FOLDER}/Choice_image.png`;

  const image = await new Choice(
    "yesNo",
    "Yes and no",
    "test/story/data/choice.jpg"
  ).image();
  await writeFile(PATH, image);

  console.log(`Choice.image: image saved at ${PATH}`);
});
