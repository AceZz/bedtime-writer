import { StoryForm } from "./story_form";

/**
 * Write and update story forms in the database.
 */
export interface StoryFormWriter {
  /**
   * Write a StoryForm.
   */
  write(form: StoryForm): Promise<string>;

  /**
   * Write the form is cached.
   *
   * The actual success of the related generation must
   * be checked prior to calling this method.
   */
  writeIsCached(id: string): Promise<void>;

  /**
   * Approve the form.
   *
   * Throws an error if the conditions for approval are not met.
   * This is prerequisite for serving the form.
   */
  approveForm(id: string): Promise<void>;
}
