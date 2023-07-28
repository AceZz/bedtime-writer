import readline from "readline/promises";

import sharp from "sharp";

import { logger } from "./logger";

/**
 * Parse the provided environment variable as a float and return it. If it does
 * not exist or the parsing fails, return `defaultValue`.
 */
export function parseEnvAsNumber(name: string, defaultValue: number): number {
  const rawValue = process.env[name];

  if (rawValue === undefined) {
    logger.warn(`Environment variable ${name} is not defined, using default.`);
    return defaultValue;
  }

  const parsedValue = parseFloat(rawValue);

  if (Number.isNaN(parsedValue)) {
    logger.warn(
      `Environment variable ${name} could not be parsed, using default.`
    );
    return defaultValue;
  }

  return parsedValue;
}

export function setsAreEqual<T>(set1: Set<T>, set2: Set<T>): boolean {
  return set1.size === set2.size && [...set1].every((item) => set2.has(item));
}

/**
 * Ask a question to the user and return the answer.
 */
export async function prompt(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer = await rl.question(query);
  rl.close();
  return answer;
}

/**
 * Compress an image to a PNG, following the provided parameters (which are
 * passed to sharp.png).
 *
 * @returns a Buffer.
 */
export async function compressToPng(
  input: Buffer,
  parameters: sharp.PngOptions
) {
  return await sharp(input).png(parameters).toBuffer();
}

/**
 * Associate a timeout to a promise. Reject if the timeout is reached. Return the race
 * promise between the given promise and the timeout.
 */
export async function promiseTimeout<T>(
  promise: Promise<T>,
  ms: number
): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(`promiseTimeout: Promise timed out after ${ms} ms`);
    }, ms);
  });
  return Promise.race([
    promise.finally(() => clearTimeout(timeoutId)),
    timeoutPromise,
  ]);
}

/**
 * Try once the given async function with specified timeout, and then retry the given number of times with a delay.
 *
 * WARNING: When retrying, previous calls of the function are not cancelled.
 *
 * Retries is bounded from 0 to 10 for safety. The delay iterator allows to implement variable types of delaying
 * strategies, like exponential delay. It should have a default value when called with no args. Then it takes the
 * previous delay and computes the new one.
 */
export async function retryAsyncFunction<T>(
  fn: () => Promise<T>,
  maxRetries = 2,
  timeout = 60000,
  delay = 1000,
  delayIterator = (x: number) => x
): Promise<{ awaited: T; retries: number }> {
  // Adds a safety for incorrect or dangerous retries specifications
  if (maxRetries < 0 || maxRetries > 10 || !Number.isInteger(maxRetries)) {
    throw new Error(
      "retryAsyncFunction: arg retries must be a positive integer between 0 and 10"
    );
  }
  for (let retry = 0; retry <= maxRetries; retry++) {
    try {
      const timedFn = () => promiseTimeout(fn(), timeout);
      const awaited = await timedFn();
      return { awaited: awaited, retries: retry };
    } catch (error) {
      if (retry === maxRetries) {
        logger.error(`retryAsyncFunction: ${error}`);
      } else {
        logger.warn(
          `retryAsyncFunction: retrying after retry ${retry} caught error: ${error}`
        );
        await sleep(delay);
        delay = delayIterator(delay);
      }
    }
  }
  throw new Error(`Maximum number of retries reached after ${maxRetries}`);
}

/**
 * Wait for the given duration in milliseconds.
 */
export async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}
