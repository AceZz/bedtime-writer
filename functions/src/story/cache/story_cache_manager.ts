import { StoryRequestV1 } from "../request";
import { StoryForm } from "../story_form";

/**
 * Interface to manage caching of stories.
 */
export interface StoryCacheManager {
  /**
   * Get all possible requests from a given story form.
   */
  generateRequests(form: StoryForm): StoryRequestV1[];

  /**
   * Cache the stories corresponding to the given requests.
   */
  cacheStories(requests: StoryRequestV1[]): Promise<void>;

  /**
   * Check the stories generated and throw an error if a check does not pass.
   */
  checkStories(): Promise<void>;
}
