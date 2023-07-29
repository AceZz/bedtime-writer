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
import { FirestoreStoryForms } from "../../../firebase/firestore_story_forms";
import { retryAsyncFunction } from "../../../utils";

export const CACHE_AUTHOR = "@CACHE_MANAGER";

//TODO: handle better request versioning, specify request manager

/**
 * Interface to manage caching of stories.
 */
export class StoryCacheV1Manager implements StoryCacheManager {
  private formId: string;
  private requestManager: StoryRequestV1Manager;
  private textApi: TextApi;
  private imageApi: ImageApi;
  private stories: FirestoreStoryCache;
  private forms: FirestoreStoryForms;

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
    this.forms = new FirestoreStoryForms(paths);
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

  async checkStories(): Promise<void> {
    const allStoryDocs = await this.stories.storiesRef().get();

    const storyDocs: string[] = [];

    for (const doc of allStoryDocs.docs) {
      // Checks existence of request doc
      await this.checkStoryRequest(doc.id);
      // Selects story docs with right form ids
      const version = this.requestManager.getVersion();
      const requestDoc = await this.stories
        .storyRequestRef(doc.id, version)
        .get();
      const requestData = requestDoc.data();
      if (requestData !== undefined && requestData.formId == this.formId) {
        storyDocs.push(doc.id);
      }
    }

    // Checks right number of stories is generated
    this.checkStoriesNumber(storyDocs);

    // Checks story docs are valid
    const promises = storyDocs.map(async (docId) => {
      await this.checkStory(docId);
    });
    await Promise.all(promises);
  }

  //TODO: write test
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

    //TODO: make this env variables
    const retries = 2;
    const delay = 1000;
    const timeout = 120000;
    await retryAsyncFunction(promiseFn, retries, delay, timeout);
  }

  private async checkStoriesNumber(storyDocs: string[]): Promise<void> {
    // Checks we have the right number of story docs
    const expectedChoicesCombinations = await this.forms.getChoicesCombinations(
      this.formId
    );
    if (storyDocs.length != expectedChoicesCombinations.length) {
      throw new Error(
        `FirestoreStoryCacheManager: The cache collection does not have the right number of stories for form ${this.formId}`
      );
    }
  }

  private async checkStory(docId: string): Promise<void> {
    this.checkStoryRequest(docId);

    const storyDoc = await this.stories.storyRef(docId).get();
    if (!storyDoc.exists) {
      throw new Error(
        `FirestoreStoryCacheManager: Cannot check story ${docId} because it does not exist`
      );
    }

    if (!storyDoc.exists) {
      throw new Error(
        `FirestoreStoryCacheManager: Story ${docId} has no request doc`
      );
    }

    const storyData = storyDoc.data();
    if (storyData === undefined) {
      throw new Error(
        `FirestoreStoryCacheManager: story ${docId} has empty data`
      );
    } else {
      this.checkStoryData(storyData, docId);
    }
  }

  private async checkStoryData(
    storyData: FirebaseFirestore.DocumentData,
    docId: string
  ) {
    if (storyData.author !== CACHE_AUTHOR) {
      throw new Error(
        `FirestoreStoryCacheManager: story ${docId} does not have the right author name ${CACHE_AUTHOR}`
      );
    }
    if (storyData.status !== "complete") {
      throw new Error(
        `FirestoreStoryCacheManager: story ${docId} has incorrect values`
      );
    }
    if (storyData.parts.length === 0) {
      throw new Error(
        `FirestoreStoryCacheManager: story ${docId} has no parts for the story`
      );
    }
    if (storyData.title == undefined || storyData.title == "") {
      throw new Error(
        `FirestoreStoryCacheManager: story ${docId} has no story title`
      );
    }
  }

  private async checkStoryRequest(storyDocId: string) {
    const version = this.requestManager.getVersion();
    const storyRequestDoc = await this.stories
      .storyRequestRef(storyDocId, version)
      .get();
    if (!storyRequestDoc.exists) {
      throw new Error(
        `FirestoreStoryCacheManager: Story ${storyDocId} has no request doc`
      );
    }

    const storyData = storyRequestDoc.data();
    if (storyData === undefined) {
      throw new Error(
        `FirestoreStoryCacheManager: story ${storyDocId} has empty request data`
      );
    }
  }
}
