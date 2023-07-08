import { FirestorePaths } from "../firebase/firestore_paths";
import { FirestoreFormReader } from "../story/reader/firestore_form_reader";
import {
  firebaseEmulatorsAreUsed,
  getFirebaseProject,
  initFirebase,
} from "../firebase/utils";
import { prompt } from "../utils";

import { FirestoreStoryCacheManager } from "../story/cache/firestore_story_cache_manager";

main().then(() => process.exit(0));

/**
 * Generate a classic story and add it to Firestore.
 */
async function main() {
  // Transform the request into a `ClassicStoryLogic`.

  const firestorePaths = new FirestorePaths();
  if (await confirm(firestorePaths)) {
    initFirebase();

    const reader = new FirestoreFormReader(firestorePaths);
    const formsWithId = await reader.readWithIds(); //TODO: this returns array, so filter for the right forms for want to use

    //TODO: manage and handle which forms we select
    const formWithId = formsWithId[0];

    const storyCacheManager = new FirestoreStoryCacheManager();
    const requests = storyCacheManager.generateRequestsFromForm(
      formWithId.storyForm
    );

    const storyPath = await storyCacheManager.setStoriesCacheDoc(
      formWithId.docId
    );

    await storyCacheManager.cacheStories(requests, storyPath);
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
