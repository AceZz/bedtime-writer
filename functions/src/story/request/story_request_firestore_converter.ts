import { StoryRequest } from "./story_request";

/**
 * Converts between a Firestore object and a specific type of StoryRequest.
 */
export interface StoryRequestFirestoreConverter<T extends StoryRequest> {
  get(id: string): Promise<T>;

  /**
   * Write the request data to Firestore.
   */
  write(request: T): Promise<string>;
}
