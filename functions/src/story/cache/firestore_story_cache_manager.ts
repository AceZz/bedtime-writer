//import * as shortUuid from "short-uuid";

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

//TODO: maybe extend to several forms
//TODO: ensure we dont hit API rate limit (bottleneck openai dalle 50 RPM)

/**
 * Interface to manage caching of stories.
 */
export class FirestoreStoryCacheManager implements StoryCacheManager {
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
        //TODO: rethink StoryLogic fields for batch job
        author: "@CACHE_BATCH_JOB",
        duration: 2,
        style: "Andersen", //TODO: fill here randomly
        ...choicesObject,
      };

      // Ensure our story request is valid
      const request = StoryRequestV1JsonConverter.convertFromJson(
        CLASSIC_LOGIC,
        logicObject
      ); //TODO: use object here with corresponding fields for selected questions
      return request;
    });

    return requests;
  }

  async cacheStories(
    requests: StoryRequestV1[]
  ): Promise<void> {
    //TODO: handle all requests

    const promises = requests.map(async (request) => {
      // Have StoryRequestV1Manager create the story doc
      const formId = "DummyID" //TODO: change

      const requestManager = new StoryRequestV1Manager({
        collection: "story__cache",
        document: formId,
        subcollection: "stories",
      }); //TODO: add subcollection on form id
      const storyId = await requestManager.create(CLASSIC_LOGIC, request.data);

      //const storyId = `${Date.now()}-${shortUuid.generate()}`;

      const logic = request.toClassicStoryLogic();
      const textApi = getTextApi();
      const imageApi = getImageApi();

      // Generate and save the story.
      const generator = new NPartStoryGenerator(logic, textApi, imageApi); //TODO: change in another PR this from stream to batch
      const metadata = new StoryMetadata(request.author, generator.title());
      const writer = new FirebaseStoryWriter("story__cache", metadata, storyId); //TODO: add subcollection on form id

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
