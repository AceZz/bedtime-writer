import { readFileSync } from "node:fs";
import { ImageApi } from "../../../story";

export const FAKE_IMAGE_BYTES_0 = readFileSync(
  "src/fake/story/generator/fake_image_api_0.jpg"
);

export const FAKE_IMAGE_BYTES_1 = readFileSync(
  "src/fake/story/generator/fake_image_api_1.jpg"
);

export class FakeImageApi implements ImageApi {
  constructor(private readonly seed: 0 | 1 = 0) {}

  async getImage(): Promise<Buffer> {
    switch (this.seed) {
      case 0:
        return FAKE_IMAGE_BYTES_0;
      case 1:
        return FAKE_IMAGE_BYTES_1;
    }
  }
}
