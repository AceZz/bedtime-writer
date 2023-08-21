import { StoryCacheV1Manager } from "../story";
import {
  FirebaseStoryFormReader,
  FirestoreContext,
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
  const firestore = new FirestoreContext();

  if (await confirm(firestore)) {
    initFirebase();

    const reader = new FirebaseStoryFormReader(
      firestore.storyFormsLanding,
      firestore.storyQuestions
    );
    const formsWithId = await reader.readMostRecentWithIds(1);

    const formWithId = formsWithId[0];

    const textApi = getTextApi();
    const imageApi = getImageApi();

    const storyCacheManager = new StoryCacheV1Manager(
      formWithId.id,
      textApi,
      imageApi,
      firestore.storyCache
    );
    const requests = storyCacheManager.generateRequests(formWithId.storyForm);

    await storyCacheManager.cacheStories(requests);
  }
}

async function confirm(firestore: FirestoreContext): Promise<boolean> {
  const projectLog = firebaseEmulatorsAreUsed()
    ? "of Firestore emulator"
    : `of project ${getFirebaseProject()}`;

  const answer = await prompt(
    `The collection ${firestore.storyCache.collectionPath} ${projectLog} ` +
      "will be populated based on " +
      `${firestore.storyFormsLanding.collectionPath}. Proceed? (y/N) `
  );

  return ["yes", "y"].includes(answer?.toLowerCase() ?? "no");
}
