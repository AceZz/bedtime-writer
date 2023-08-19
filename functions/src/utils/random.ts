/**
 * Make a copy of `items`, shuffle and return it.
 */
export function shuffleCopy<T>(items: T[]): T[] {
  const copy = items.slice();
  shuffle(copy);
  return copy;
}

/**
 * Shuffle an array in-place using the Fisher-Yates algorithm.
 */
export function shuffle<T>(items: T[]) {
  for (let i = 0; i < items.length - 1; i++) {
    const swapIndex = getRandomInt(i + 1, items.length);
    const swap = items[swapIndex];
    items[swapIndex] = items[i];
    items[i] = swap;
  }
}

/**
 * Return a random integer between min (inclusive) and max (exclusive).
 */
export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min) + min);
}
