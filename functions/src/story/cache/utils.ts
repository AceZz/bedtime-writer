/**
 * Create the cartesian product of an array of <T> arrays. Throw an error if one array is empty.
 */
export function cartesianProduct<T>(arrays: T[][]): T[][] {
  if (arrays.length === 0) {
    throw new Error(
      "cartesianProduct: No string array was provided for the cartesian product of choices."
    );
  }

  if (arrays.some((subArray) => subArray.length === 0)) {
    throw new Error(
      "cartesianProduct: Empty arrays are not allowed for the cartesian product of choices."
    );
  }

  return arrays.reduce<T[][]>(
    (a: T[][], b: T[]) => {
      return a.flatMap((d: T[]) => b.map((e: T) => [...d, e]));
    },
    [[]]
  );
}
