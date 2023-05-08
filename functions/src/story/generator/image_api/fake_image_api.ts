import { readFileSync } from "node:fs";

import { ImageApi } from "./image_api";

export const FAKE_IMAGE_BYTES = readFileSync(
  "src/story/generator/image_api/fake_image_api.jpg"
);

/**
 * Implementation of the `ImageApi` for fake data.
 */
export class FakeImageApi implements ImageApi {
  async getImage(): Promise<Buffer> {
    return FAKE_IMAGE_BYTES;
  }
}
