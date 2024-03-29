/**
 * Generate all the stories that can be obtained from a generated form
 * contained in the Firestore database.
 */

import { parseEnvAsNumber, prompt, retryAsyncFunction } from "../utils";
import {
  FirebaseStoryFormWriter,
  FirebaseStoryReader,
  FirebaseStoryWriter,
  FirestoreContext,
  initEnv,
  initFirebase,
} from "../firebase";
import {
  ImageApi,
  NPartStoryGenerator,
  StoryForm,
  StoryFormWriter,
  StoryLogic,
  StoryMetadata,
  StoryReader,
  StoryStatus,
  TextApi,
} from "../story";
import { getImageApi, getTextApi } from "../api";
import _ from "lodash";
import {
  firebaseEmulatorsAreUsed,
  getFirebaseProject,
  promptInitLocalSecrets,
} from "../firebase/utils";
import { logger } from "../logger";

export const CACHE_USER = "@STORY_GEN_CACHE";

type MissingStory = {
  metadata: StoryMetadata;
  logic: StoryLogic;
  id: string | undefined;
};

class StoryFormGenerator {
  private allAnswers: Map<string, string>[];
  private storyTextApi: TextApi;
  private textApi: TextApi;
  private imageApi: ImageApi;
  private storyReader: StoryReader;
  private formWriter: StoryFormWriter;

  constructor(
    private readonly formId: string,
    private readonly form: StoryForm,
    private readonly firestore: FirestoreContext
  ) {
    this.allAnswers = form.getAllAnswers();
    this.storyTextApi = getTextApi("gpt-4");
    this.textApi = getTextApi("gpt-3.5-turbo");
    this.imageApi = getImageApi();

    this.storyReader = new FirebaseStoryReader(firestore.storyCacheLanding);
    this.formWriter = new FirebaseStoryFormWriter(firestore.storyFormsLanding);
  }

  /**
   * Ask the user to choose a `StoryForm` and create a `StoryFormGenerator` from
   * it.
   */
  static async prompt(
    firestore: FirestoreContext
  ): Promise<StoryFormGenerator> {
    // Download the `StoryForm`s.
    const forms = await firestore.storyFormsLanding.get({ isCached: false });

    if (forms.size === 0) {
      console.log(
        "The stories of all the forms in " +
          `${firestore.storyFormsLanding.collectionPath} are cached.\n` +
          "Call `npm run story_forms_gen` to generate new forms.\n" +
          "Abort."
      );
      process.exit();
    }

    // Choose the `StoryForm` to generate.
    console.log(`The stories of ${forms.size} form(s) can be cached.`);

    while (true) {
      let index = 0;

      for (const [formId, form] of forms.entries()) {
        console.log(`\nForm ${formId} (${index + 1} / ${forms.size}):\n`);
        console.log(form.toString());
        const answer = (
          await prompt("\nChoose this form? (y/N/q) ")
        ).toLowerCase();

        if (["y", "yes"].includes(answer)) {
          return new StoryFormGenerator(formId, form, firestore);
        }
        if (["q", "quit"].includes(answer)) {
          console.log("Abort.");
          process.exit(0);
        }

        index++;
      }
    }
  }

  /**
   * Generate the missing stories.
   */
  async run(): Promise<void> {
    // Generate the missing stories.
    const missingStories = await this.getMissingStories();

    const projectLog = firebaseEmulatorsAreUsed()
      ? "of Firestore emulator"
      : `of project ${getFirebaseProject()}`;
    const answer = (
      await prompt(
        `${missingStories.length} stories / ${this.allAnswers.length} ` +
          "are missing.\n" +
          "Cache them into collection " +
          `${this.firestore.storyCacheLanding.collectionPath} ${projectLog}? ` +
          "(y/N) "
      )
    ).toLowerCase();
    if (!["y", "yes"].includes(answer)) {
      console.log("Abort.");
      process.exit(0);
    }

    await Promise.all(
      missingStories.map((story) => this.generateMissingStory(story))
    );

    // Delete stories with failed generation.
    await this.deleteFailedStories();

    // Check the result.
    const missingStoriesAfterGen = await this.getMissingStories();
    const numCachedStories =
      missingStories.length - missingStoriesAfterGen.length;

    if (missingStoriesAfterGen.length == 0) {
      // No story is missing.
      await this.formWriter.writeIsCached(this.formId);
      const count = await this.storyReader.countAll();

      console.log(
        `Success: ${numCachedStories} stories / ${missingStories.length} ` +
          "were cached.\n" +
          `Form ${this.formId} has ${this.allAnswers.length} ` +
          "cached stories.\n" +
          `Collection ${this.firestore.storyCacheLanding.collectionPath} ` +
          `now contains ${count} cached stories.`
      );
    } else {
      // Some stories are missing.
      console.log(
        `Fail: ${numCachedStories} stories / ${missingStories.length} ` +
          "were cached.\n" +
          `Form ${this.formId} has ` +
          `${this.allAnswers.length - missingStoriesAfterGen.length} ` +
          `cached stories, ${missingStoriesAfterGen.length} stories ` +
          "are missing.\n" +
          "Run `npm run story_forms_cache` again."
      );
    }
  }

  private async deleteFailedStories(): Promise<void> {
    const stories = await this.storyReader.readFormStories(this.formId);
    const deleteResults: number[] = await Promise.all(
      stories.map(async (story) => {
        if (story.status !== StoryStatus.COMPLETE) {
          // This is a failed story which we delete.
          const writer = new FirebaseStoryWriter(
            this.firestore.storyCacheLanding,
            story.id
          );
          await writer.delete(story.id);
          return 1;
        }
        return 0;
      })
    );
    const numFailedStories = deleteResults.reduce((acc, val) => acc + val, 0);
    logger.debug(
      `deleteFailedStories: deleted ${numFailedStories} failed stories.`
    );
  }

  private async getMissingStories(): Promise<MissingStory[]> {
    const stories = await this.storyReader.readFormStories(this.formId);

    // Will contain the stories that are not in `stories` at all and the stories
    // which status is not `COMPLETE` (which encountered an error, for
    // instance).
    const missingStories = [];

    for (const answers of this.allAnswers) {
      const request = this.answersToRequest(answers);
      const metadata = new StoryMetadata(CACHE_USER, request);
      const logic = this.form.toClassicLogic(answers);
      let hasACompleteStory = false;

      for (const story of stories) {
        if (_.isEqual(story.metadata.request, request)) {
          if (story.status === StoryStatus.COMPLETE) {
            // There is a story for `answer`and it is `COMPLETE`, so
            // it should not be rewritten.
            hasACompleteStory = true;
            break;
          }
        }
      }

      // `answer` has no appropriate story, either because there was no story
      // at all, or because none of the generated stories was `COMPLETE`.
      if (!hasACompleteStory) {
        missingStories.push({
          metadata,
          logic,
          id: undefined,
        });
      }
    }

    return missingStories;
  }

  private answersToRequest(answers: Map<string, string>): object {
    return {
      formId: this.formId,
      ...Object.fromEntries(answers),
    };
  }

  private async generateMissingStory(story: MissingStory): Promise<void> {
    const promiseFn = async () => {
      const writer = new FirebaseStoryWriter(
        this.firestore.storyCacheLanding,
        story.id
      );

      // `writeInit` throws if `story.id !== undefined`.
      if (story.id === undefined) await writer.writeInit(story.metadata);

      const generator = new NPartStoryGenerator(
        story.logic,
        this.storyTextApi,
        this.textApi,
        this.imageApi
      );
      return writer.writeFromGenerator(story.logic, generator);
    };

    const maxTries = parseEnvAsNumber("CACHE_RETRY_MAX_TRIES", 3);
    const timeout = parseEnvAsNumber("CACHE_RETRY_TIMEOUT", 120000);
    const delay = parseEnvAsNumber("CACHE_RETRY_DELAY", 1000);
    const params = { maxTries: maxTries, timeout: timeout, delay: delay };
    try {
      await retryAsyncFunction(promiseFn, params);
    } catch (error) {
      logger.error(
        `generateMissingStory: maximum number of tries reached for story ${story.id}. Final error: ${error}`
      );
    }
  }
}

async function main() {
  initEnv();

  if (
    process.env.TEXT_API?.toLowerCase() !== "fake" ||
    process.env.IMAGE_API?.toLowerCase() !== "fake"
  ) {
    await promptInitLocalSecrets();
  }

  initFirebase();

  const firestore = new FirestoreContext();
  const generator = await StoryFormGenerator.prompt(firestore);
  await generator.run();
}

main().then(() => process.exit(0));
