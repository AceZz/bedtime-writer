import { readFileSync } from "node:fs";

import { ImageApi } from "./image_api";

export const FAKE_IMAGE_BYTES_0 = readFileSync(
  "src/story/generator/image_api/fake_image_api_0.jpg"
);

/**
 * Implementation of the `ImageApi` for fake data.
 */
export class FakeImageApi implements ImageApi {
  async getImage(): Promise<Buffer> {
    return FAKE_IMAGE_BYTES_0;
  }
}
