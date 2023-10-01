/**
 * Generate random story forms from the questions in the Firestore database.
 *
 * This tool uses the questions uploaded to Firestore. If there are no
 * questions, run `story_set_questions` first.
 */

import { prompt } from "../utils";
import {
  firebaseEmulatorsAreUsed,
  getFirebaseProject,
  initEnv,
  initFirebase,
  FirestoreContext,
  FirebaseStoryFormWriter,
} from "../firebase";
import { StoryFormManager, StoryQuestion, StoryForm } from "../story";

const NUM_QUESTIONS_PER_FORM = 3;
const NUM_CHOICES_PER_QUESTION = 3;
const MAX_GENERATION_TRIES = 10;

main().then(() => process.exit(0));

async function main() {
  initEnv();
  initFirebase();
  const firestore = new FirestoreContext();

  const numForms = parseInt(
    await prompt("How many forms should be generated? ")
  );
  const generatedForms = await generateForms(numForms, firestore);

  if (await confirm(firestore, numForms)) {
    const writer = new FirebaseStoryFormWriter(firestore.storyFormsLanding);

    for (const form of generatedForms) {
      await writer.write(form);
    }

    console.log(
      `${numForms} forms written to ${firestore.storyFormsLanding.collectionPath}.`
    );
  } else {
    console.log("Abort.");
  }
}

async function generateForms(
  numExtraForms: number,
  firestore: FirestoreContext
): Promise<StoryForm[]> {
  const questions = await readQuestions(firestore);
  const formManager = new StoryFormManager(
    Array.from(questions.values()),
    NUM_QUESTIONS_PER_FORM,
    NUM_CHOICES_PER_QUESTION
  );

  const currentForms = await readForms(firestore);

  // To avoid duplicates with and within the generated forms, we register the
  // IDs of the current forms.
  const fullIds = new Set(
    Array.from(currentForms.values()).map((form) => form.fullId())
  );
  const forms: StoryForm[] = [];

  // The generation is based on randomness, so we might not reach the number of
  // target forms if there are duplicates, hence the retries.
  for (let try_ = 0; try_ < MAX_GENERATION_TRIES; try_++) {
    const numGeneratedForms = numExtraForms - forms.length;
    console.log(
      `Generating ${numGeneratedForms} forms... ` +
        `(try ${try_ + 1} / ${MAX_GENERATION_TRIES})`
    );

    for (const formCandidate of formManager.generateForms(numGeneratedForms)) {
      if (!fullIds.has(formCandidate.fullId())) {
        forms.push(formCandidate);
        fullIds.add(formCandidate.fullId());
      }
    }

    console.log(
      `... in total, ${forms.length} forms were generated without duplicates.`
    );

    if (forms.length === numExtraForms) {
      return forms;
    }
  }

  throw Error("Maximum number of tries reached.");
}

async function readQuestions(
  firestore: FirestoreContext
): Promise<Map<string, StoryQuestion>> {
  const questions = await firestore.storyQuestions.get();

  if (questions.size === 0) {
    throw Error(
      `No questions were found in ${firestore.storyQuestions.collectionPath}` +
        "Please run `npm run story_set_questions`."
    );
  }

  console.log(
    `${questions.size} questions were found in ` +
      `${firestore.storyQuestions.collectionPath}.`
  );

  return questions;
}

async function readForms(
  firestore: FirestoreContext
): Promise<Map<string, StoryForm>> {
  const currentForms = await firestore.storyFormsLanding.get();
  console.log(
    `${currentForms.size} forms were found in ` +
      `${firestore.storyFormsLanding.collectionPath}.`
  );
  return currentForms;
}

async function confirm(
  firestore: FirestoreContext,
  numForms: number
): Promise<boolean> {
  const projectLog = firebaseEmulatorsAreUsed()
    ? "of Firestore emulator"
    : `of project ${getFirebaseProject()}`;

  const answer = await prompt(
    `The collection ${firestore.storyFormsLanding.collectionPath} ${projectLog} ` +
      `will be added ${numForms} forms. Proceed? (y/N) `
  );

  return ["yes", "y"].includes(answer?.toLowerCase() ?? "no");
}
