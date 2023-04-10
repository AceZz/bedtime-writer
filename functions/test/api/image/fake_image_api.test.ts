import { expect, test } from "@jest/globals";

import {
  FakeImageApi,
  FAKE_IMAGE_BYTES,
} from "../../../src/api/image/fake_image_api";

test("getImage", async () => {
  const api = new FakeImageApi();
  const image = await api.getImage();

  expect(image).toBe(FAKE_IMAGE_BYTES);
});
