/**
 * Add a story form corresponding to the provided YAML file (defaults to
 * DEFAULT_YAML_PATH).
 */

import { prompt } from "./utils";
import {
  firebaseEmulatorsAreUsed,
  getFirebaseProject,
  initFirebase,
} from "./firebase/utils";
import { FirestoreFormWriter, YAMLFormReader } from "./story";

const DEFAULT_COLLECTION_NAME = "story__forms";
const DEFAULT_YAML_PATH = "data/story/form.yaml";

main().then(() => process.exit(0));

async function main() {
  const collectionName = DEFAULT_COLLECTION_NAME;
  const yamlPath = getYamlPath();

  if (await confirm(collectionName, yamlPath)) {
    initFirebase();

    const reader = new YAMLFormReader(yamlPath);
    const form = await reader.read();

    const writer = new FirestoreFormWriter(collectionName);
    await writer.write(form);
    console.log(`Form saved to ${DEFAULT_COLLECTION_NAME}.`);
  } else {
    console.log("Abort");
  }
}

function getYamlPath(): string {
  return process.argv.at(2) ?? DEFAULT_YAML_PATH;
}

async function confirm(
  collectionName: string,
  yamlPath: string
): Promise<boolean> {
  const projectLog = firebaseEmulatorsAreUsed()
    ? "of Firestore emulator"
    : `of project ${getFirebaseProject()}`;

  const answer = await prompt(
    `The collection ${collectionName} ${projectLog} will be added the ` +
      `content of ${yamlPath}. Proceed? (y/N) `
  );

  return ["yes", "y"].includes(answer?.toLowerCase() ?? "no");
}