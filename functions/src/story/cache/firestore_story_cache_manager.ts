import { getImageApi, getTextApi } from "../../api";
import { logger } from "../../logger";
import { NPartStoryGenerator } from "../generator";
import { CLASSIC_LOGIC } from "../logic";
import { StoryRequestV1, StoryRequestV1Manager } from "../request";
import { StoryRequestV1JsonConverter } from "../request/v1/story_request_v1_json_converter";
import { StoryForm } from "../story_form";
import { StoryMetadata } from "../story_metadata";
import { FirebaseStoryWriter } from "../writer";
import { StoryCacheManager } from "./story_cache_manager";
import { cartesianProduct } from "./utils";
import { FirestorePaths } from "../../firebase/firestore_paths";
import { getRandomDuration, getRandomStyle } from "../story_utils";
import { FirestoreStoryCache } from "../../firebase/firestore_story_cache";
import { SubCollectionPath } from "../../collection";

//TODO: maybe extend to several forms
//TODO: ensure we dont hit API rate limit (bottleneck openai dalle 50 RPM)

/**
 * Interface to manage caching of stories.
 */
export class FirestoreStoryCacheManager implements StoryCacheManager {
  private collection: FirestoreStoryCache;

  constructor() {
    this.collection = new FirestoreStoryCache();
  }

  generateRequestsFromForm(form: StoryForm): StoryRequestV1[] {
    const questions = form.questions;

    // Unpack the questions map to arrays for convenience
    const choicesArrays: string[][] = [];
    const questionsArray: string[] = [];
    for (const [question, choices] of questions) {
      questionsArray.push(question);
      choicesArrays.push(choices);
    }

    // Compute all possibilities of choices
    const choicesCombinations = cartesianProduct(choicesArrays);

    // Pick one possible choices combination
    const requests = choicesCombinations.map((choicesCombination) => {
      const entriesChoicesCombination = questionsArray.map(
        (question, index) => [question, choicesCombination[index]]
      );

      const choicesObject = Object.fromEntries(entriesChoicesCombination);

      const logicObject = {
        author: "@CACHE_BATCH_JOB",
        duration: getRandomDuration(),
        style: getRandomStyle(),
        ...choicesObject,
      };

      // Ensure our story request is valid
      const request = StoryRequestV1JsonConverter.convertFromJson(
        CLASSIC_LOGIC,
        logicObject
      );
      return request;
    });

    return requests;
  }

  async setStoriesCacheDoc(formId: string): Promise<SubCollectionPath> {
    const firestorePaths = new FirestorePaths();

    // Initiate the doc for this batch of stories cache
    const cacheDocRef = this.collection.cacheRef().doc();

    await cacheDocRef.set({ formId: formId });

    const storiesPath: SubCollectionPath = {
      collection: firestorePaths.story.cache,
      docId: cacheDocRef.id,
      subcollection: firestorePaths.story.stories,
    };

    return storiesPath;
  }

  async cacheStories(
    requests: StoryRequestV1[],
    storiesPath: SubCollectionPath
  ): Promise<void> {
    const promises = requests.map(async (request) => {
      const requestManager = new StoryRequestV1Manager(storiesPath);
      const storyId = await requestManager.create(CLASSIC_LOGIC, request.data);

      // Prepare APIs
      const logic = request.toClassicStoryLogic();
      const textApi = getTextApi();
      const imageApi = getImageApi();

      // Generate and save the story.
      const generator = new NPartStoryGenerator(logic, textApi, imageApi);
      const metadata = new StoryMetadata(request.author, generator.title());
      const writer = new FirebaseStoryWriter(storiesPath, metadata, storyId);

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
    });

    await Promise.all(promises);
  }
}
