export * from "./combinations";
export * from "./random";

import readline from "readline/promises";

import sharp from "sharp";

import { logger } from "../logger";

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
 * Create the cartesian product of an array of <T> arrays. Throw an error if one array is empty.
 */
export function cartesianProduct<T>(arrays: T[][]): T[][] {
  if (arrays.length === 0) {
    throw new Error("cartesianProduct: no array provided.");
  }

  if (arrays.some((subArray) => subArray.length === 0)) {
    throw new Error("cartesianProduct: empty arrays are not allowed.");
  }

  return arrays.reduce<T[][]>(
    (a: T[][], b: T[]) => {
      return a.flatMap((d: T[]) => b.map((e: T) => [...d, e]));
    },
    [[]]
  );
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
  params: {
    maxTries: number;
    timeout: number;
    delay: number;
    delayIterator?: (x: number) => number;
  }
): Promise<{ result: T; tries: number }> {
  // Unpacks parameters
  const maxTries = params.maxTries;
  const timeout = params.timeout;
  let delay = params.delay;
  const delayIterator = params.delayIterator ?? ((x: number) => x); // Default value is identity function

  // Adds a safety for incorrect or dangerous retries specifications
  if (maxTries < 1 || maxTries > 10 || !Number.isInteger(maxTries)) {
    throw new Error(
      "retryAsyncFunction: arg maxTries must be a positive integer between 0 and 10"
    );
  }

  let finalError: unknown;
  for (let try_ = 1; try_ <= maxTries; try_++) {
    try {
      const timedFn = () => promiseTimeout(fn(), timeout);
      const result = await timedFn();
      return { result: result, tries: try_ };
    } catch (error) {
      logger.warn(
        `retryAsyncFunction: error on try ${try_} / ${maxTries}: ${error}`
      );
      if (try_ < maxTries) {
        await sleep(delay);
        delay = delayIterator(delay);
      } else {
        logger.error(
          `retryAsyncFunction: maximum number of retries reached after ${maxTries} tries`
        );
        finalError = error;
      }
    }
  }
  throw finalError;
}

/**
 * Wait for the given duration in milliseconds.
 */
export async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

/**
 * Transform a list of items with an `id` attribute to a map of the same
 * items indexed by `id`.
 */
export function listToMapById<K, V extends { id: K }>(list: V[]): Map<K, V> {
  const map = new Map();
  for (const item of list) {
    map.set(item.id, item);
  }
  return map;
}
