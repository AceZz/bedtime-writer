/**
 * Set the story cache according to all choices possibilities from story form.
 */

import { prompt } from "../utils";
import {
  firebaseEmulatorsAreUsed,
  getFirebaseProject,
  initFirebase,
} from "../firebase/utils";
import { FirebaseQuestionWriter, YAMLQuestionReader } from "../story";
import { FirestorePaths } from "../firebase/firestore_paths";

const DEFAULT_COLLECTION_NAME = "story__caches";

main().then(() => process.exit(0));

async function main() {
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
