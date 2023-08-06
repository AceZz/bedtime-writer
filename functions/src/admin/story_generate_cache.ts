import { FirebaseFormReader, StoryCacheV1Manager } from "../story";
import {
  FirestorePaths,
  firebaseEmulatorsAreUsed,
  getFirebaseProject,
  initEnv,
  initFirebase,
} from "../firebase";
import { prompt } from "../utils";

import { getImageApi, getTextApi } from "../api";

main().then(() => process.exit(0));

/**
 * Generate a classic story and add it to Firestore.
 */
async function main() {
  initEnv();
  const firestorePaths = new FirestorePaths();
  if (await confirm(firestorePaths)) {
    initFirebase();

    const reader = new FirebaseFormReader(firestorePaths);
    const formsWithId = await reader.readMostRecentWithIds(1);

    const formWithId = formsWithId[0];

    const textApi = getTextApi();
    const imageApi = getImageApi();

    const storyCacheManager = new StoryCacheV1Manager(
      formWithId.id,
      textApi,
      imageApi
    );
    const requests = storyCacheManager.generateRequests(formWithId.storyForm);

    await storyCacheManager.cacheStories(requests);
  }
}

async function confirm(paths: FirestorePaths): Promise<boolean> {
  const projectLog = firebaseEmulatorsAreUsed()
    ? "of Firestore emulator"
    : `of project ${getFirebaseProject()}`;

  const answer = await prompt(
    `The collection ${paths.story.cache} ${projectLog} will be populated ` +
      `based on ${paths.story.forms}. Proceed? (y/N) `
  );

  return ["yes", "y"].includes(answer?.toLowerCase() ?? "no");
}
