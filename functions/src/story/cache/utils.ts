/**
 * Create the cartesian product of an array of string arrays. Throw an error if one array is empty.
 */
export function cartesianProduct(arrays: string[][]): string[][] {
  if (arrays.length === 0) {
    throw new Error(
      "generateStoriesCache: No string array was provided for the cartesian product of choices."
    );
  }

  if (arrays.some((subArray) => subArray.length === 0)) {
    throw new Error(
      "generateStoriesCache: Empty arrays are not allowed for the cartesian product of choices."
    );
  }

  return arrays.reduce<string[][]>(
    (a: string[][], b: string[]) => {
      return a.flatMap((d: string[]) => b.map((e: string) => [...d, e]));
    },
    [[]]
  );
}
