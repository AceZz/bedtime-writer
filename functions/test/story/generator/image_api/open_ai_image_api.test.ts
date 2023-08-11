/**
 * These tests are skipped by default because they use the real OpenAI API.
 * When running them, a manual check is advised, hence the `console.log`.
 *
 * Fill the `KEY` variable before launching them.
 */
import { mkdir, writeFile } from "node:fs/promises";

import { beforeAll, describe, test } from "@jest/globals";
import { OpenAiImageApi } from "../../../../src/story";
import { getOpenAiApi } from "../../../../src/open_ai";

describe.skip("OpenAiImageApi", () => {
  const OUTPUT_FOLDER = "test/output";
  const KEY = "...";
  const API = new OpenAiImageApi(getOpenAiApi(KEY));

  beforeAll(async () => {
    await mkdir(OUTPUT_FOLDER, { recursive: true });
  });

  test("getImage", async () => {
    const PATH = `${OUTPUT_FOLDER}/OpenAiImageApi_getImage.png`;
    const image = await API.getImage(
      "A painting of a French baguette with a dramatic light.",
      { size: "256x256" }
    );

    await writeFile(PATH, image);
    console.log(`OpenAiImageApi.getImage: image saved at ${PATH}`);
  }, 20_000);
});
