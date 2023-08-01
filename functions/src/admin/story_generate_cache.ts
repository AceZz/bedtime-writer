import { FirestorePaths } from "../firebase/firestore_paths";
import { FirestoreFormReader } from "../story/reader/firestore_form_reader";
import {
  firebaseEmulatorsAreUsed,
  getFirebaseProject,
  initFirebase,
} from "../firebase/utils";
import { prompt } from "../utils";

import { StoryCacheV1Manager } from "../story/cache/v1/firestore_story_cache_manager";
import { getImageApi, getTextApi } from "../api";

main().then(() => process.exit(0));

/**
 * Generate a classic story and add it to Firestore.
 */
async function main() {
  const firestorePaths = new FirestorePaths();
  if (await confirm(firestorePaths)) {
    initFirebase();

    const reader = new FirestoreFormReader(firestorePaths);
    const formsWithId = await reader.readMostRecentWithIds(1);

    const formWithId = formsWithId[0];

    const textApi = getTextApi();
    const imageApi = getImageApi();

    const storyCacheManager = new StoryCacheV1Manager(
      formWithId.docId,
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
