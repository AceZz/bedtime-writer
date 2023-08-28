import { readFileSync } from "node:fs";
import { ImageApi } from "../../../story";

export const FAKE_IMAGE_BYTES = readFileSync(
  "src/fake/story/generator/fake_image_api.jpg"
);

/**
 * Implementation of the `ImageApi` for fake data.
 */
export class FakeImageApi implements ImageApi {
  async getImage(): Promise<Buffer> {
    return FAKE_IMAGE_BYTES;
  }
}
