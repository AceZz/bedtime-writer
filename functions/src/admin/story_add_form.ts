/**
 * Add a story form corresponding to the provided YAML file (defaults to
 * DEFAULT_YAML_PATH).
 */

import { prompt } from "../utils";
import {
  firebaseEmulatorsAreUsed,
  getFirebaseProject,
  initEnv,
  initFirebase,
  FirestoreContext,
} from "../firebase";
import { FirebaseFormWriter, YAMLFormReader } from "../story";

const DEFAULT_YAML_PATH = "admin_data/story/form.yaml";

main().then(() => process.exit(0));

async function main() {
  initEnv();
  const firestore = new FirestoreContext();
  const yamlPath = getYamlPath();

  if (await confirm(firestore, yamlPath)) {
    initFirebase();
    const reader = new YAMLFormReader(yamlPath);
    const form = await reader.read();

    const writer = new FirebaseFormWriter(
      firestore.storyForms,
      firestore.storyQuestions
    );
    await writer.write(form);
    console.log(`Form saved to ${firestore.storyForms.collectionPath}.`);
  } else {
    console.log("Abort");
  }
}

function getYamlPath(): string {
  return process.argv.at(2) ?? DEFAULT_YAML_PATH;
}

async function confirm(
  firestore: FirestoreContext,
  yamlPath: string
): Promise<boolean> {
  const projectLog = firebaseEmulatorsAreUsed()
    ? "of Firestore emulator"
    : `of project ${getFirebaseProject()}`;

  const answer = await prompt(
    `The collection ${firestore.storyForms.collectionPath} ${projectLog} ` +
      `will be added the content of ${yamlPath}. Proceed? (y/N) `
  );

  return ["yes", "y"].includes(answer?.toLowerCase() ?? "no");
}
