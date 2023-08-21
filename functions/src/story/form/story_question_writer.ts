import { StoryQuestion } from "./story_question";

/**
 * Write a list of StoryQuestion objects.
 */
export interface StoryQuestionWriter {
  /**
   * Write `questions`.
   */
  write(questions: StoryQuestion[]): Promise<void>;
}
