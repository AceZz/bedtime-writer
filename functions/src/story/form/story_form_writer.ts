import { StoryForm } from "./story_form";

/**
 * This class writes a StoryForm object.
 *
 */
export interface StoryFormWriter {
  write(form: StoryForm): Promise<void>;
}
