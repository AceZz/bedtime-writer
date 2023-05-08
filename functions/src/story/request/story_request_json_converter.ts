import { StoryRequest } from "./story_request";

/**
 * Converts between a JSON object and a specific type of StoryRequest.
 */
export interface StoryRequestJsonConverter<T extends StoryRequest> {
  fromJson(logic: string, raw: object): T;

  toJson(request: T): object;
}
