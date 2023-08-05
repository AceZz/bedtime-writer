import { ImageApi, NPartStoryGenerator, TextApi } from "../../generator";
import { CLASSIC_LOGIC } from "../../logic";
import { StoryRequestV1, StoryRequestV1Manager } from "../../request";
import { StoryForm } from "../../story_form";
import { StoryMetadata } from "../../story_metadata";
import { FirebaseStoryWriter } from "../../writer";
import { StoryCacheManager } from "../story_cache_manager";
import { getRandomDuration, getRandomStyle } from "../../story_utils";
import { FirestoreStoryCache } from "../../../firebase/firestore_story_cache";
import { FirestorePaths } from "../../../firebase/firestore_paths";
import { parseEnvAsNumber, retryAsyncFunction } from "../../../utils";
import { FirestoreStoryForms } from "../../../firebase/firestore_story_forms";
import { StoryStatus } from "../../story_status";

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
    this.requestManager = new StoryRequestV1Manager(this.stories);
    this.forms = new FirestoreStoryForms(paths);
  }

  generateRequests(form: StoryForm): StoryRequestV1[] {
    const { questions, formResponses } = form.getAllFormResponses();

    const requests = formResponses.map((formResponse) => {
      return this.generateRequest(questions, formResponse);
    });
    return requests;
  }

  private generateRequest(
    questions: string[],
    formResponse: string[]
  ): StoryRequestV1 {
    const requestData: { [key: string]: string | number } = {
      formId: this.formId,
      author: CACHE_AUTHOR,
      duration: getRandomDuration(),
      style: getRandomStyle(),
    };
    if (questions.length !== formResponse.length) {
      throw new Error(
        "generateRequest: length of questions and formResponse must be the same"
      );
    }

    for (let i = 0; i < questions.length; i++) {
      requestData[questions[i]] = formResponse[i];
    }

    // Ensure our story request is valid
    const request = this.requestManager.jsonConverter.fromJson(
      CLASSIC_LOGIC,
      requestData
    );
    return request;
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

  //TODO: write tests
  async deleteExcessStories(): Promise<void> {
    const { questions, formResponses } = await this.forms.getAllFormResponses(
      this.formId
    );
    const deletePromises = formResponses.map(async (formResponse) => {
      this.deleteExcessFormResponseStories(questions, formResponse);
    });
    await Promise.all(deletePromises);
  }

  async deleteExcessFormResponseStories(
    questions: string[],
    formResponse: string[]
  ): Promise<void> {
    const { docs: stories } = await this.stories.getFormResponseStories(
      this.formId,
      questions,
      formResponse
    );
    const { docs: completeStories } = await this.stories.getFormResponseStories(
      this.formId,
      questions,
      formResponse,
      StoryStatus.COMPLETE
    );

    if (completeStories.length == 0) {
      throw new Error(
        `deleteExcessFormResponseStories: no complete story was found for formId ${this.formId} and formResponse ${formResponse}.`
      );
    }

    // Keep one complete story per form response and delete the rest
    const completeStoryId = completeStories[0].id;
    const deletePromises = stories
      .filter((story) => story.id != completeStoryId)
      .map((story) => this.stories.deleteStory(story.id));
    await Promise.all(deletePromises);
  }

  //TODO: write tests
  async checkStories(): Promise<void> {
    const { docs } = await this.stories.getFormIdStories(this.formId);

    // Checks right number of stories is generated
    this.checkStoriesNumber(docs);

    // Checks story docs are valid
    const promises = docs.map(async (docs) => {
      await this.checkStory(docs.id);
    });
    await Promise.all(promises);
  }

  private async checkStoriesNumber(
    docs: FirebaseFirestore.QueryDocumentSnapshot[]
  ): Promise<void> {
    // Checks we have as many docs as possible form responses
    const { questions: expectedFormResponses } =
      await this.forms.getAllFormResponses(this.formId);
    if (docs.length != expectedFormResponses.length) {
      throw new Error(
        `checkStoriesNumber: the cache collection does not have the right number of stories for form ${this.formId}.` +
          `${docs.length} stories were found instead of ${expectedFormResponses.length} expected.`
      );
    }
  }

  private async checkStory(id: string): Promise<void> {
    const storyDoc = await this.stories.storyRef(id).get();
    if (!storyDoc.exists) {
      throw new Error(
        `checkStory: cannot check story ${id} because it does not exist`
      );
    }

    if (!storyDoc.exists) {
      throw new Error(`checkStory: story ${id} has no request doc`);
    }

    const storyData = storyDoc.data();
    if (storyData === undefined) {
      throw new Error(`checkStory: story ${id} has empty data`);
    } else {
      this.checkStoryData(storyData, id);
    }
  }

  private async checkStoryData(
    storyData: FirebaseFirestore.DocumentData,
    docId: string
  ) {
    if (storyData.author !== CACHE_AUTHOR) {
      throw new Error(
        `checkStoryData: story ${docId} does not have the right author name ${CACHE_AUTHOR}`
      );
    }
    if (storyData.status !== "complete") {
      throw new Error(`checkStoryData: story ${docId} has incorrect values`);
    }
    if (storyData.parts.length === 0) {
      throw new Error(
        `checkStoryData: story ${docId} has no parts for the story`
      );
    }
    if (storyData.title == undefined || storyData.title == "") {
      throw new Error(`checkStoryData: story ${docId} has no story title`);
    }
  }
}
