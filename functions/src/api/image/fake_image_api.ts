import { readFileSync } from "node:fs";

import { ImageApi } from "../../story/generator";

export const FAKE_IMAGE_BYTES = readFileSync(
  "src/api/image/fake_image_bytes.jpg"
);

/**
 * Implementation of the `ImageApi` for fake data.
 */
export class FakeImageApi implements ImageApi {
  async getImage(): Promise<Buffer> {
    return FAKE_IMAGE_BYTES;
  }
}
