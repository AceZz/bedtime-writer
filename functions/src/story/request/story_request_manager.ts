import { StoryRequest } from "./story_request";

/**
 * Used to add and retrieve requests.
 */
export interface StoryRequestManager<T extends StoryRequest> {
  /**
   * Retrieve a request.
   */
  get(id: string): Promise<T>;

  /**
   * Create a request and return its id.
   */
  create(data: object): Promise<string>;
}
