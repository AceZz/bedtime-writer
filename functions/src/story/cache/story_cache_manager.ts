import { StoryRequestV1 } from "../request";
import { StoryPath } from "../request/v1/story_request_v1";
import { StoryForm } from "../story_form";

/**
 * Interface to manage caching of stories.
 */
export interface StoryCacheManager {
  /**
   * Get all possible requests from a given story form.
   */
  generateRequestsFromForm(
    form: StoryForm
  ): StoryRequestV1[];

  /**
   * Create the doc for stories cache with corresponding formId in the cache collection.
   * Return the StoryPath to navigate the database.
   */
  setStoriesCacheDoc(formId: string): Promise<StoryPath>;

  /**
   * Cache the stories corresponding to the given requests.
   */
  cacheStories(
    requests: StoryRequestV1[],
    storyPath: StoryPath
  ): Promise<void>;
}
