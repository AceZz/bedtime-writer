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
   * Retrieve requestManager version.
   */
  getVersion(): string;

  /**
   * Create a request and return its id.
   *
   * By default, the request has a `PENDING` status.
   */
  create(logic: string, data: object): Promise<string>;
}
