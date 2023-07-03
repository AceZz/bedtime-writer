import { FirestorePaths } from "../firebase/firestore_paths";
import { FirestoreFormReader } from "../story/reader/firestore_form_reader";
import {
  firebaseEmulatorsAreUsed,
  getFirebaseProject,
  initFirebase,
} from "../firebase/utils";
import { prompt } from "../utils";

main().then(() => process.exit(0));

//TODO: handle case where user has the form of the day before, sends his request just at the moment where the form changes so the new cached stories it hits don't match anymore

/**
 * Generate a classic story and add it to Firestore.
 */
async function main() {
  // Transform the request into a `ClassicStoryLogic`.

  const paths = new FirestorePaths();
  console.log("Executing main function");

  if (await confirm(paths)) {
    initFirebase();

    const reader = new FirestoreFormReader(paths);
    const forms = await reader.read(); //TODO: this returns array, so filter for the right forms for want to use

    console.log(forms);

    const form = forms[0]; //TODO: handle which form we select

    const questions = form.questions;

    console.log(questions);

    const choicesArrays = [];
    for (const [, choices] of questions) {
      choicesArrays.push(choices)
    }

    const choicesCartesianProduct = cartesianProduct(choicesArrays);
    console.log(choicesCartesianProduct);

    

  }
  // TODO: capture logic here, do for loop
  //const logic = request.toClassicStoryLogic();

  //   // TODO: get text api
  //   const textApi = getTextApi();

  //   //TODO: get imGE pi
  //   const imageApi = getImageApi();

  //   // Generate and save the story.
  //   const generator = new NPartStoryGenerator(logic, textApi, imageApi);
  //   const metadata = new StoryMetadata(request.author, generator.title());
  //   const writer = new FirebaseStoryWriter(metadata, storyId);

  //   await writer.writeMetadata();

  //   try {
  //     // Write story to database part after part
  //     for await (const part of generator.storyParts()) {
  //       await writer.writePart(part);
  //     }

  //     await writer.writeComplete();
  //     logger.info(
  //       `createClassicStory: story ${storyId} was generated and added to Firestore`
  //     );
  //   } catch (error) {
  //     await writer.writeError();
  //     logger.error(
  //       `createClassicStory: story ${storyId} encountered an error: ${error}`
  //     );
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

/**
 * Create the cartesian product of an array of string arrays. Throw an error if one array is empty.
 */
function cartesianProduct(arrays: string[][]): string[][] {

  if (arrays.length === 0) {
    throw new Error("generateStoriesCache: No string array was provided for the cartesian product of choices.");
  }

  if (arrays.some(subArray => subArray.length === 0)) {
    throw new Error("generateStoriesCache: Empty arrays are not allowed for the cartesian product of choices.");
  }

  return arrays.reduce<string[][]>((a: string[][], b: string[]) => {
    return a.flatMap((d: string[]) => b.map((e: string) => [...d, e]));
  }, [[]]);
}

