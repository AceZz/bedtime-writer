import { test } from "@jest/globals";

import { compressToPng } from "../../../src/api/image/utils";
import { FAKE_IMAGE_BYTES } from "../../../src/api/image/fake_image_api";

test("compressToPng", async () => {
  await compressToPng(FAKE_IMAGE_BYTES, {});
});
