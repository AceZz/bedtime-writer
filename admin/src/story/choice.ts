import { readFile } from "fs/promises";
import { compressToPng } from "../utils";

const IMAGE_COMPRESSION_PARAMETERS = {
  cpuEffort: 10,
  compressionLevel: 9,
  adaptiveFiltering: true,
};

/**
 * A choice of a question.
 */
export class Choice {
  constructor(
    readonly id: string,
    readonly text: string,
    readonly imagePath: string
  ) {}

  /**
   * Read `imagePath` and return the compressed image.
   */
  async image(): Promise<Buffer> {
    const data = await readFile(this.imagePath);

    const sizeBefore = data.length;
    const compressed = await compressToPng(data, IMAGE_COMPRESSION_PARAMETERS);
    const sizeAfter = compressed.length;

    return sizeBefore <= sizeAfter ? data : compressed;
  }
}
