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
   * Write the form is generated.
   *
   * The actual success of the related generation must
   * be checked prior to calling this method.
   */
  writeIsGenerated(id: string): Promise<void>;

  /**
   * Write the form is approved.
   *
   * The conditions for form approval must
   * be checked prior to calling this method.
   */
  writeIsApproved(id: string): Promise<void>;
}
