/**
 * Return `cartesianProduct(arrays)[i]` without having to generate the whole
 * product.
 */
export function ithCartesianProduct<T>(i: number, arrays: T[][]): T[] {
  // We assume that `i` is `j * N + k`, where:
  //   * `j` is the `j`th item of the cartesian product of `arrays[:-1]`.
  //   * `N` is `arrays[-1].length`.
  //   * `k` is the index of the last item of the product in `arrays[-1]`.

  if (i < 0) throw new Error(`ithCartesianProduct: i = ${i} < 0`);
  if (i >= numCartesianProduct(arrays)) {
    throw new Error(`ithCartesianProduct: index ${i} does not exist.`);
  }

  if (arrays.length === 0) return [];

  const last = arrays.at(-1) ?? [];
  if (last.length === 0) {
    throw new Error("ithCartesianProduct: empty arrays are not allowed.");
  }
  const lastIndex = i % last.length;

  const rest = arrays.slice(0, -1);
  // Use Math.round just in case there are float issues with the division.
  const restIndex = Math.round((i - lastIndex) / last.length);

  return [...ithCartesianProduct(restIndex, rest), last[lastIndex]];
}

/**
 * Create the cartesian product of an array of <T> arrays.
 *
 * The generated terms follow a "lexographical" order (based on the order given
 * by the input, not the order of the _values_).
 *
 * If `arrays` is:
 * [[A, B],
 *  [Y, X]]
 *
 * Then the generated terms are:
 * [A, Y]
 * [A, X]
 * [B, Y]
 * [B, X]
 *
 * Throw an error if one array is empty.
 */
export function* cartesianProduct<T>(arrays: T[][]): Generator<T[]> {
  if (arrays.length === 0) {
    yield [];
  } else {
    if (arrays[0].length === 0) {
      throw new Error("cartesianProduct: empty arrays are not allowed.");
    }

    const rest = arrays.slice(1);
    for (const item of arrays[0]) {
      for (const restItems of cartesianProduct(rest)) {
        yield [item, ...restItems];
      }
    }
  }
}

/**
 * Return the number of items in the cartesian product.
 */
export function numCartesianProduct<T>(arrays: T[][]): number {
  let num = 1;
  for (const array of arrays) {
    if (array.length === 0) {
      throw new Error("numCartesianProduct: empty arrays are not allowed.");
    }
    num *= array.length;
  }
  return num;
}
