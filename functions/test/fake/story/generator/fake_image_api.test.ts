import { expect, test } from "@jest/globals";
import { FAKE_IMAGE_BYTES_0, FakeImageApi } from "../../../../src/fake";

test("getImage", async () => {
  const api = new FakeImageApi();
  const image = await api.getImage();

  expect(image).toBe(FAKE_IMAGE_BYTES_0);
});
