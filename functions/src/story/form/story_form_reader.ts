import { StoryForm } from "./story_form";

/**
 * Read `StoryForm` from Firebase.
 */
export interface StoryFormReader {
  readAll(): Promise<StoryForm[]>;

  readNotGenerated(): Promise<StoryForm[]>;
}
