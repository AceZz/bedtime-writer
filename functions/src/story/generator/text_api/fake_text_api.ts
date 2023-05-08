import { readFileSync } from "fs";

import { Readable } from "stream";
import { TextApi } from "./text_api";

const FAKE_TOKENS = readFileSync("src/story/generator/text_api/fake_text.txt");

/**
 * Parse `value` to an int and clamp it between a minimum and maximum.
 * If `value` is undefined, return the maximum.
 */
function parseIntAndClamp(
  value: string | undefined,
  min: number,
  max: number
): number {
  if (value === undefined) {
    return max;
  }
  return Math.max(min, Math.min(parseInt(value), max));
}

/**
 * Wait the specified number of milliseconds.
 */
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Implementation of the `TextApi` for fake data.
 */
export class FakeTextApi implements TextApi {
  constructor(
    private readonly _numParts?: number,
    private readonly _numTokensPerPart?: number
  ) {}

  get numParts(): number {
    return (
      this._numParts ??
      parseIntAndClamp(process.env.FAKE_TEXT_API_NUM_PARTS, 1, 10)
    );
  }

  get numTokensPerPart(): number {
    return (
      this._numTokensPerPart ??
      parseIntAndClamp(process.env.FAKE_TEXT_API_NUM_TOKENS_PER_PART, 1, 200)
    );
  }

  async getText(): Promise<string> {
    return Array.from(this.getTokens()).join("");
  }

  async getStream(): Promise<Readable> {
    return Readable.from(this.getTokensWithWait(100));
  }

  /**
   * Generate the list of tokens used by `getText` and `getStream`.
   */
  *getTokens(): Generator<string> {
    for (const part of this.getParts()) {
      for (const token of part) {
        yield token;
      }

      yield "\n\n";
    }
  }

  async *getTokensWithWait(waitTime: number): AsyncGenerator<string> {
    for (const part of this.getParts()) {
      for (const token of part) {
        yield token;
      }

      yield "\n\n";
      await wait(waitTime);
    }
  }

  *getParts(): Generator<string[]> {
    const text = FAKE_TOKENS.toString();

    for (const part of text.split("\n\n").slice(0, this.numParts)) {
      yield part
        .split(" ")
        .slice(0, this.numTokensPerPart)
        .map((token) => `${token} `);
    }
  }
}
