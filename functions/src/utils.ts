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
