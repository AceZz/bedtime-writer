/**
 * Sleep until `ms` is elapsed.
 */
export async function sleep(ms) {
  new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Block until the function `condition` evaluates to true.
 */
export async function waitFor(condition) {
  while (!condition()) {
    await sleep(1000);
  }
  return;
}
