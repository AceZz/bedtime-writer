/**
 * Set the story questions according to the provided YAML file (defaults to
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
import { YAMLStoryQuestionReader } from "../yaml";

const DEFAULT_YAML_PATH = "admin_data/story/questions.yaml";

main().then(() => process.exit(0));

async function main() {
  initEnv();
  const firestore = new FirestoreContext();
  const yamlPath = getYamlPath();

  if (await confirm(firestore, yamlPath)) {
    initFirebase();
    const reader = new YAMLStoryQuestionReader(yamlPath);
    const questions = Array.from((await reader.get()).values());

    await firestore.storyQuestions.write(questions);
    console.log(
      `${questions.length} question(s) saved to ` +
        `${firestore.storyQuestions.collectionPath}.`
    );
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
    `The collection ${firestore.storyQuestions.collectionPath} ${projectLog} ` +
      `will be set to the content of ${yamlPath}. Proceed? (y/N) `
  );

  return ["yes", "y"].includes(answer?.toLowerCase() ?? "no");
}
