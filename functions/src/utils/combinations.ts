import { shuffleCopy } from "./random";

/**
 * Uniformly sample `num` combinations of `k` among `items`.
 *
 * If `num` is `undefined`, it is the maximum number of combinations (so we
 * yield all combinations but in a random order).
 */
export function* sampleCombinations<T>(
  num: number | undefined,
  k: number,
  items: T[]
): Generator<T[]> {
  const total = numCombinations(k, items.length);

  if (num === undefined) num = total;
  if (num < 0) throw `sampleCombinations: invalid num = ${num} < 0`;

  const indices = shuffleCopy([...Array(total).keys()]).slice(0, num);

  for (const index of indices) {
    yield ithCombination(index, k, items);
  }
}

/**
 * Generate the ith combination, in the lexographical order, of `k` among
 * `items`.
 *
 * Note: this function does not check for duplicates. Every element of `items`
 * is considered as unique.
 */
export function ithCombination<T>(i: number, k: number, items: T[]): T[] {
  if (i < 0) throw Error(`ithCombination: i = ${i} < 0`);

  const numTotal = numCombinations(k, items.length);
  if (i >= numTotal)
    throw Error(`ithCombination: i = ${i} >= numTotal = ${numTotal}`);

  if (k === 0) return [];

  // The combinations space can be divided in two: with items[0] and without
  // items[0]. There are (k - 1) among (items.length - 1) combinations with
  // items[0], so the logic depends on whether `i` is lower or greater than
  // this number.
  const numCombinationsWithFirst = numCombinations(k - 1, items.length - 1);

  // With items[0].
  if (i < numCombinationsWithFirst) {
    return [items[0], ...ithCombination(i, k - 1, items.slice(1))];
  }

  // Without items[0].
  // The index must be shifted to account for the removal of the combinations
  // with items[0].
  return ithCombination(i - numCombinationsWithFirst, k, items.slice(1));
}

/**
 * Generate sublists corresponding to all combinations of `k` among `items`.
 * The generated sublists are ordered in the lexographical order.
 *
 * For instance, 2 among [a, b, c, d] will yield
 * [a, b], [a, c], [a, d], [b, c], [b, d], [c, d]
 *
 * Note: this function does not check for duplicates. Every element of `items`
 * is considered as unique.
 */
export function* combinations<T>(k: number, items: T[]): Generator<T[]> {
  if (k < 0) throw Error(`combinations: invalid k = ${k} < 0`);
  if (k > items.length)
    throw Error(
      `combinations: invalid k = ${k} > items.length = ${items.length}`
    );

  for (const indices of combinationsIndices(k, items.length)) {
    yield indices.map((i) => items[i]);
  }
}

/**
 * Generate the indices corresponding to all combinations of `k` among a list of
 * `n` items.
 * The generated indices are ordered in the lexographical order.
 *
 * For instance, 2 among 4 will yield
 * [0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]
 *
 * This function is dedicated to le papa des Taupins #bof
 */
export function* combinationsIndices(
  k: number,
  n: number
): Generator<number[]> {
  if (k < 0) throw Error(`combinationsIndices: invalid k = ${k} < 0`);
  if (k > n) throw Error(`combinationsIndices: invalid k = ${k} > n = ${n}`);

  if (k === 0) {
    yield [];
  } else {
    // Example: k = 2, n = 4. i goes from 0 to 2.
    // i is the first item of each combination yielded inside this loop.
    // For instance, if i = 1, all combinations will start with 1: [1, 2] and
    // [1, 3].
    for (let i = 0; i < n - k + 1; i++) {
      // To generate the rest of the combination, we generate all k - 1
      // combinations from i + 1 to n.
      // To make it start at 0, we shift it by i + 1,
      // so from 0 to n - (i + 1) = n - i - 1.
      const subCombinations = combinationsIndices(k - 1, n - i - 1);
      for (const indices of subCombinations) {
        // We "cancel" the shift by adding i + 1.
        yield [i, ...indices.map((x) => x + i + 1)];
      }
    }
  }
}

export function numCombinations(k: number, n: number): number {
  if (k < 0) throw Error(`numCombinations: invalid k = ${k} < 0`);
  if (k > n) throw Error(`numCombinations: invalid k = ${k} > n = ${n}`);

  // Product of `n - k + 1, n - k + 2, ..., n`.
  // Generate the numbers from 0 to k - 1, then shift by n - k + 1.
  const numerator = [...Array(k).keys()]
    .map((x) => x + n - k + 1)
    .reduce((prod, x) => prod * x, 1);

  // Product of `1, 2, ..., k`.
  const denominator = [...Array(k).keys()]
    .map((x) => x + 1)
    .reduce((prod, x) => prod * x, 1);

  return numerator / denominator;
}
