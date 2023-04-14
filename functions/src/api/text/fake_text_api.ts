import { PassThrough, Stream } from "stream";
import { TextApi } from "../../story/generator";

export const FAKE_TOKENS = getFakeTokens(500);

function getFakeTokens(num: number): string[] {
  return [...Array(num)].map((_, i) => `T${i} `);
}

/**
 * Implementation of the `TextApi` for fake data.
 */
export class FakeTextApi implements TextApi {
  async getText(): Promise<string> {
    return FAKE_TOKENS.join("");
  }

  async getStream(): Promise<Stream> {
    const stream = new PassThrough();

    setTimeout(() => {
      for (const token of FAKE_TOKENS) {
        stream.emit("data", token);
      }
      stream.emit("end");
    }, 1000);

    return stream;
  }
}
