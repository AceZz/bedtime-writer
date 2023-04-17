import { expect, test } from "@jest/globals";
import {
  FAKE_IMAGE_BYTES,
  FakeImageApi,
} from "../../../../src/story/generator/image_api/fake_image_api";

test("getImage", async () => {
  const api = new FakeImageApi();
  const image = await api.getImage();

  expect(image).toBe(FAKE_IMAGE_BYTES);
});
