import { StoryRequest } from "./story_request";
import { StoryRequestStatus } from "./story_request_status";

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
   *
   * By default, the request has a `PENDING` status.
   */
  create(logic: string, data: object): Promise<string>;

  /**
   * Update the status of a request.
   */
  updateStatus(id: string, status: StoryRequestStatus): Promise<void>;
}
