import { test } from "@jest/globals";
import { compressToPng } from "../../../../src/story/generator/image_api/utils";
import { FAKE_IMAGE_BYTES } from "../../../../src/story/generator/image_api/fake_image_api";

test("compressToPng", async () => {
  await compressToPng(FAKE_IMAGE_BYTES, {});
});
