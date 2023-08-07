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
  FirestorePaths,
} from "../firebase";
import { FirebaseQuestionWriter, YAMLQuestionReader } from "../story";

const DEFAULT_COLLECTION_NAME = "story__questions";
const DEFAULT_YAML_PATH = "admin_data/story/questions.yaml";

main().then(() => process.exit(0));

async function main() {
  initEnv();
  const paths = new FirestorePaths();
  const yamlPath = getYamlPath();

  if (await confirm(paths, yamlPath)) {
    initFirebase();
    const reader = new YAMLQuestionReader(yamlPath);
    const questions = await reader.read();

    const writer = new FirebaseQuestionWriter(paths);
    await writer.write(questions);
    console.log(
      `${questions.length} question(s) saved to ${DEFAULT_COLLECTION_NAME}.`
    );
  } else {
    console.log("Abort");
  }
}

function getYamlPath(): string {
  return process.argv.at(2) ?? DEFAULT_YAML_PATH;
}

async function confirm(
  paths: FirestorePaths,
  yamlPath: string
): Promise<boolean> {
  const projectLog = firebaseEmulatorsAreUsed()
    ? "of Firestore emulator"
    : `of project ${getFirebaseProject()}`;

  const answer = await prompt(
    `The collection ${paths.story.questions} ${projectLog} will be set to ` +
      `the content of ${yamlPath}. Proceed? (y/N) `
  );

  return ["yes", "y"].includes(answer?.toLowerCase() ?? "no");
}
