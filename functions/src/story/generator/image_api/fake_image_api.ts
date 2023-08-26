import { readFileSync } from "node:fs";

import { ImageApi } from "./image_api";

export const FAKE_IMAGE_BYTES_0 = readFileSync(
  "src/story/generator/image_api/fake_image_api_0.jpg"
);

export const FAKE_IMAGE_BYTES_1 = readFileSync(
  "src/story/generator/image_api/fake_image_api_1.jpg"
);

export class FakeImageApi implements ImageApi {
  private readonly seed: 0 | 1;

  constructor(seed?: 0 | 1) {
    this.seed = seed ?? 0;
  }

  async getImage(): Promise<Buffer> {
    switch (this.seed) {
      case 0:
        return FAKE_IMAGE_BYTES_0;
      case 1:
        return FAKE_IMAGE_BYTES_1;
    }
  }
}
