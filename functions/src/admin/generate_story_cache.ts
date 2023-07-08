import { FirestorePaths } from "../firebase/firestore_paths";
import { FirestoreFormReader } from "../story/reader/firestore_form_reader";
import {
  firebaseEmulatorsAreUsed,
  getFirebaseProject,
  initFirebase,
} from "../firebase/utils";
import { prompt } from "../utils";

import * as dotenv from "dotenv";
import { FirestoreStoryCacheManager } from "../story/cache/firestore_story_cache_manager";

dotenv.config({ path: "../../.env.local" });

main().then(() => process.exit(0));

//TODO: handle case where user has the form of the day before, sends his request just at the moment where the form changes so the new cached stories it hits don't match anymore

/**
 * Generate a classic story and add it to Firestore.
 */
async function main() {
  // Transform the request into a `ClassicStoryLogic`.

  const paths = new FirestorePaths();
  if (await confirm(paths)) {
    initFirebase();

    const reader = new FirestoreFormReader(paths);
    const forms = await reader.read(); //TODO: this returns array, so filter for the right forms for want to use

    const form = forms[0]; //TODO: handle which form we select

    const storyCacheManager = new FirestoreStoryCacheManager();
    const requests = storyCacheManager.generateRequestsFromForm(form); //TODO: handle all requests

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
