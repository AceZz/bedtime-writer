import { FirestorePaths } from "../firebase/firestore_paths";
import { FirestoreFormReader } from "../story/reader/firestore_form_reader";
import {
  firebaseEmulatorsAreUsed,
  getFirebaseProject,
  initFirebase,
} from "../firebase/utils";
import { prompt } from "../utils";
import { StoryRequestV1JsonConverter } from "../story/request/v1/story_request_v1_json_converter";

import {
  OpenAiTextApi,
  OpenAiImageApi,
  FakeTextApi,
  FakeImageApi,
  FirebaseStoryWriter,
  NPartStoryGenerator,
  StoryMetadata,
  ImageApi,
  TextApi,
  CLASSIC_LOGIC,
} from "../story/";
import { logger } from "../logger";
import { getOpenAiApi } from "../open_ai";
import { FirestoreUserStatsManager } from "../user";
import { StoryRequestV1Manager } from "../story/request";

import * as dotenv from "dotenv";

dotenv.config({ path: "../../.env.local" });

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

    const form = forms[0]; //TODO: handle which form we select

    const questions = form.questions;

    // Unpack the questions map to arrays for convenience
    const choicesArrays: string[][] = [];
    const questionsArray: string[] = [];
    for (const [question, choices] of questions) {
      questionsArray.push(question);
      choicesArrays.push(choices);
    }

    // Compute all possibilities of choices
    const choicesCartesianProduct = cartesianProduct(choicesArrays);

    // Pick one possible choices combination
    const choicesCombination = choicesCartesianProduct[0]; //TODO: make loop here

    const entriesChoicesCombination = questionsArray.map((question, index) => [
      question,
      choicesCombination[index],
    ]);

    const choicesObject = Object.fromEntries(entriesChoicesCombination);

    const logicObject = {
      //TODO: rethink StoryLogic fields for batch job
      author: "@CACHE_BATCH_JOB",
      duration: 2,
      style: "Andersen",
      ...choicesObject,
    };

    console.log(logicObject); //TODO: make logic and questions naming similar

    // Ensure our story request is valid
    const request = StoryRequestV1JsonConverter.convertFromJson(
      CLASSIC_LOGIC,
      logicObject
    ); //TODO: use object here with corresponding fields for selected questions

    // Have StoryRequestV1Manager create the story doc
    const requestManager = new StoryRequestV1Manager();
    const storyId = await requestManager.create(CLASSIC_LOGIC, request.data);

    const logic = request.toClassicStoryLogic();
    const textApi = getTextApi();
    const imageApi = getImageApi();

    // Generate and save the story.
    const generator = new NPartStoryGenerator(logic, textApi, imageApi); //TODO: change in another PR this from stream to batch
    const metadata = new StoryMetadata(request.author, generator.title());
    const writer = new FirebaseStoryWriter(metadata, storyId);

    await writer.writeMetadata();

    try {
      // Write story to database part after part
      for await (const part of generator.storyParts()) {
        await writer.writePart(part);
      }
      await writer.writeComplete();
      logger.info(
        `createClassicStory: story ${storyId} was generated and added to Firestore`
      );

    } catch (error) {
      await writer.writeError();
      logger.error(
        `createClassicStory: story ${storyId} created by user ${request.author} encountered an error: ${error}`
      );
    }
  }
}

function getTextApi(): TextApi {
  if (process.env.TEXT_API?.toLowerCase() === "fake") {
    logger.info("using FakeTextApi");
    return new FakeTextApi();
  }

  logger.info("using OpenAiTextApi");
  return new OpenAiTextApi(
    getOpenAiApi(process.env.OPENAI_API_KEY),
    "gpt-3.5-turbo"
  );
}

function getImageApi(): ImageApi {
  if (process.env.IMAGE_API?.toLowerCase() === "fake") {
    logger.info("using FakeImageApi");
    return new FakeImageApi();
  }

  logger.info("using OpenAiImageApi");
  return new OpenAiImageApi(getOpenAiApi(process.env.OPENAI_API_KEY));
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
    throw new Error(
      "generateStoriesCache: No string array was provided for the cartesian product of choices."
    );
  }

  if (arrays.some((subArray) => subArray.length === 0)) {
    throw new Error(
      "generateStoriesCache: Empty arrays are not allowed for the cartesian product of choices."
    );
  }

  return arrays.reduce<string[][]>(
    (a: string[][], b: string[]) => {
      return a.flatMap((d: string[]) => b.map((e: string) => [...d, e]));
    },
    [[]]
  );
}
