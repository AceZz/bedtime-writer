import { CollectionPath, SubCollectionPath } from "../../collection";
import { StoryRequestV1 } from "../request";
import { StoryForm } from "../story_form";

/**
 * Interface to manage caching of stories.
 */
export interface StoryCacheManager {
  /**
   * Get all possible requests from a given story form.
   */
  generateRequestsFromForm(form: StoryForm): StoryRequestV1[];

  /**
   * Create the doc for stories cache with corresponding formId in the cache collection.
   * Return the CollectionPath to navigate the database.
   */
  setStoriesCacheDoc(formId: string): Promise<CollectionPath>;

  /**
   * Cache the stories corresponding to the given requests.
   */
  cacheStories(
    requests: StoryRequestV1[],
    storiesPath: SubCollectionPath
  ): Promise<void>;
}
