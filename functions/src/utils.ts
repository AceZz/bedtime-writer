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

//TODO: write tests
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
 */
export async function retryAsyncFunction<T>(
  fn: () => Promise<T>,
  retries = 2,
  delay = 1000,
  timeout = 60000
): Promise<T> {
  if (retries < 0 || !Number.isInteger(retries)) {
    throw new Error(
      "retryAsyncFunction: arg retries must be a positive integer"
    );
  }
  if (delay < 1 || !Number.isInteger(delay)) {
    throw new Error("retryAsyncFunction: arg delay must be a positive integer");
  }
  if (timeout < 1000 || !Number.isInteger(timeout)) {
    throw new Error(
      "retryAsyncFunction: arg timeout should be a positive integer and bigger than 1000ms"
    );
  }
  try {
    const timedFn = () => promiseTimeout(fn(), timeout);
    return await timedFn();
  } catch (error) {
    if (retries >= 1) {
      await sleep(delay);
      return retryAsyncFunction(fn, retries - 1, delay, timeout);
    } else {
      logger.error("retry: Maximum number of retries reached");
      throw error;
    }
  }
}

/**
 * Wait for the given duration in milliseconds.
 */
export async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}
