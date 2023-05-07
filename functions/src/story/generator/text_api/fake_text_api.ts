import { readFileSync } from "fs";

import { Readable } from "stream";
import { TextApi } from "./text_api";

const FAKE_TOKENS = readFileSync("src/story/generator/text_api/fake_text.txt");

/**
 * Parse `value` to an int and clamp it between a minimum and maximum.
 * If `value` is undefined, return `defaultValue`.
 */
function parseIntAndClamp(
  value: string | undefined,
  min: number,
  max: number,
  defaultValue: number
): number {
  if (value === undefined) {
    return defaultValue;
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
    private readonly _numTokensPerPart?: number,
    private readonly _startWait?: number,
    private readonly _partWait?: number
  ) {}

  get numParts(): number {
    return (
      this._numParts ??
      parseIntAndClamp(process.env.FAKE_TEXT_API_NUM_PARTS, 1, 10, 10)
    );
  }

  get numTokensPerPart(): number {
    return (
      this._numTokensPerPart ??
      parseIntAndClamp(
        process.env.FAKE_TEXT_API_NUM_TOKENS_PER_PART,
        1,
        200,
        200
      )
    );
  }

  get startWait(): number {
    return (
      this._startWait ??
      parseIntAndClamp(process.env.FAKE_TEXT_API_START_WAIT, 0, 10000, 1500)
    );
  }

  get partWait(): number {
    return (
      this._partWait ??
      parseIntAndClamp(process.env.FAKE_TEXT_API_PART_WAIT, 0, 10000, 1500)
    );
  }

  async getText(): Promise<string> {
    return Array.from(this.getTokens()).join("");
  }

  async getStream(): Promise<Readable> {
    return Readable.from(this.getTokensWithWait());
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

  async *getTokensWithWait(): AsyncGenerator<string> {
    await wait(this.startWait);

    for (const part of this.getParts()) {
      for (const token of part) {
        yield token;
      }

      yield "\n\n";
      await wait(this.partWait);
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
