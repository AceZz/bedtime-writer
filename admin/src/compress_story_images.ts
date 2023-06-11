/**
 * Compress the images in the provided folder (defaults to `DEFAULT_FOLDER`)
 * recursively and in place.
 *
 * Supported extension: JPG, PNG.
 */

import { readFile, readdir, writeFile } from "fs/promises";
import { compressToPng, prompt } from "./utils";
import { extname, join } from "path";

const DEFAULT_FOLDER = "data/story/";
const EXTENSIONS = [".jpg", ".jpeg", ".png"];
const COMPRESSION_PARAMETERS = {
  cpuEffort: 10,
  compressionLevel: 9,
  adaptiveFiltering: true,
};

main().then(() => process.exit(0));

async function main() {
  const folder = getFolder();

  if (await confirm(folder)) {
    await compressFolder(folder);
  } else {
    console.log("Abort");
  }
}

function getFolder(): string {
  return process.argv.at(2) ?? DEFAULT_FOLDER;
}

async function confirm(folder: string): Promise<boolean> {
  const answer = await prompt(
    `The images in ${folder} will be compressed recursively IN PLACE. ` +
      "Proceed? (y/N) "
  );

  return ["yes", "y"].includes(answer?.toLowerCase() ?? "no");
}

/**
 * Compress the images in a folder recursively.
 */
async function compressFolder(path: string) {
  const files = await readdir(path, { withFileTypes: true });

  await Promise.all(
    files.map((file) =>
      file.isDirectory()
        ? compressFolder(join(path, file.name))
        : compressFile(join(path, file.name))
    )
  );
}

async function compressFile(path: string) {
  const extension = extname(path).toLowerCase();

  if (EXTENSIONS.includes(extension)) {
    const input = await readFile(path);
    const sizeBefore = input.length;

    const compressed = await compressToPng(input, COMPRESSION_PARAMETERS);
    const sizeAfter = compressed.length;

    if (sizeBefore <= sizeAfter) {
      console.log(`${path}: ${prettySize(sizeBefore)} is minimal`);
    } else {
      console.log(
        `${path}: ${prettySize(sizeBefore)} -> ${prettySize(sizeAfter)}`
      );
      await writeFile(path, compressed);
    }
  }
}

function prettySize(size: number): string {
  if (size < 1000) {
    return `${size} B`;
  }
  return `${size / 1000} kB`;
}
