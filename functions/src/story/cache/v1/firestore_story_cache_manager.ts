import { ImageApi, NPartStoryGenerator, TextApi } from "../../generator";
import { CLASSIC_LOGIC } from "../../logic";
import { StoryRequestV1, StoryRequestV1Manager } from "../../request";
import { StoryForm } from "../../story_form";
import { StoryMetadata } from "../../story_metadata";
import { FirebaseStoryWriter } from "../../writer";
import { StoryCacheManager } from "../story_cache_manager";
import { cartesianProduct } from "../utils";
import { getRandomDuration, getRandomStyle } from "../../story_utils";
import { FirestoreStoryCache } from "../../../firebase/firestore_story_cache";
import { FirestorePaths } from "../../../firebase/firestore_paths";
import { parseEnvAsNumber, retryAsyncFunction } from "../../../utils";

export const CACHE_AUTHOR = "@CACHE_V1_MANAGER";

/**
 * Interface to manage caching of stories.
 */
export class StoryCacheV1Manager implements StoryCacheManager {
  private formId: string;
  private requestManager: StoryRequestV1Manager;
  private textApi: TextApi;
  private imageApi: ImageApi;
  private stories: FirestoreStoryCache;

  constructor(
    formId: string,
    textApi: TextApi,
    imageApi: ImageApi,
    paths?: FirestorePaths
  ) {
    this.formId = formId;
    this.textApi = textApi;
    this.imageApi = imageApi;
    this.stories = new FirestoreStoryCache(paths);
    this.requestManager = new StoryRequestV1Manager(this.stories); //TODO: update below using this new property
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
        author: CACHE_AUTHOR,
        duration: getRandomDuration(),
        style: getRandomStyle(),
        ...choicesObject,
      };

      const requestData = { formId: this.formId, ...logicObject };

      // Ensure our story request is valid
      const request = this.requestManager.jsonConverter.fromJson(
        CLASSIC_LOGIC,
        requestData
      );
      return request;
    });

    return requests;
  }

  async cacheStories(requests: StoryRequestV1[]): Promise<void> {
    const promises = requests.map(async (request) => {
      await this.cacheStory(request);
    });
    await Promise.all(promises);
  }

  private async cacheStory(request: StoryRequestV1): Promise<void> {
    const promiseFn = async () => {
      const storyId = await this.requestManager.create(
        CLASSIC_LOGIC,
        request.data
      );

      // Set the logic
      const logic = request.toClassicStoryLogic();

      // Generate and save the story.
      const generator = new NPartStoryGenerator(
        logic,
        this.textApi,
        this.imageApi
      );
      const metadata = new StoryMetadata(request.author, generator.title());
      const writer = new FirebaseStoryWriter(this.stories, metadata, storyId);

      await writer.writeFromGenerator(generator);
    };

    const maxTries = parseEnvAsNumber("CACHE_RETRY_MAX_TRIES", 3);
    const timeout = parseEnvAsNumber("CACHE_RETRY_TIMEOUT", 120000);
    const delay = parseEnvAsNumber("CACHE_RETRY_DELAY", 1000);
    const params = { maxTries: maxTries, timeout: timeout, delay: delay };
    await retryAsyncFunction(promiseFn, params);
  }
}
