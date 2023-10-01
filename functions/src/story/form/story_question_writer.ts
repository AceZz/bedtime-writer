import { StoryQuestion } from "./story_question";

/**
 * Write a list of StoryQuestion objects.
 */
export interface StoryQuestionWriter {
  /**
   * Write `questions`.
   *
   * After the operation, the storage contains exactly the same data as what
   * was provided. In other words, any data not in `questions` is removed.
   */
  write(questions: StoryQuestion[]): Promise<void>;
}
