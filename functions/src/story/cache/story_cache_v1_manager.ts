import { ImageApi, NPartStoryGenerator, TextApi } from "../generator";
import { CLASSIC_LOGIC } from "../logic";
import { StoryRequestV1, StoryRequestV1Manager } from "../request";
import { StoryChoice, StoryForm, StoryQuestion } from "../form";
import { StoryMetadata } from "../story_metadata";
import { StoryCacheManager } from "./story_cache_manager";
import { FirestoreStoryCache, FirebaseStoryWriter } from "../../firebase";
import { parseEnvAsNumber, retryAsyncFunction } from "../../utils";

export const CACHE_AUTHOR = "@CACHE_V1_MANAGER";

const styles: string[] = [
  "the Arabian Nights",
  "Hans Christian Andersen",
  "the Brothers Grimm",
  "Charles Perrault",
];

const durations: number[] = [2, 3, 4, 5];

function getRandomStyle(): string {
  return styles[Math.floor(Math.random() * styles.length)];
}

function getRandomDuration(): number {
  return durations[Math.floor(Math.random() * styles.length)];
}

/**
 * Interface to manage caching of stories.
 */
export class StoryCacheV1Manager implements StoryCacheManager {
  private formId: string;
  private requestManager: StoryRequestV1Manager;
  private textApi: TextApi;
  private imageApi: ImageApi;

  constructor(
    formId: string,
    textApi: TextApi,
    imageApi: ImageApi,
    private readonly stories: FirestoreStoryCache
  ) {
    this.formId = formId;
    this.textApi = textApi;
    this.imageApi = imageApi;
    this.requestManager = new StoryRequestV1Manager(this.stories);
  }

  generateRequests(form: StoryForm): StoryRequestV1[] {
    const answers = form.getAllAnswers();

    const requests = answers.map(() => {
      return this.generateRequest([], []);
    });
    return requests;
  }

  private generateRequest(
    questions: StoryQuestion[],
    formResponse: StoryChoice[]
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
      requestData[questions[i].promptParam] = formResponse[i].id;
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
}
