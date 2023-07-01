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
export class StoryChoice {
  constructor(
    readonly id: string,
    readonly text: string,
    readonly image: Buffer
  ) {}

  /**
   * Read `imagePath` and return a `StoryChoice` with the compressed image.
   */
  static async fromImagePath(
    id: string,
    text: string,
    imagePath: string
  ): Promise<StoryChoice> {
    const data = await readFile(imagePath);

    const sizeBefore = data.length;
    const compressed = await compressToPng(data, IMAGE_COMPRESSION_PARAMETERS);
    const sizeAfter = compressed.length;

    return new StoryChoice(
      id,
      text,
      sizeBefore <= sizeAfter ? data : compressed
    );
  }
}
