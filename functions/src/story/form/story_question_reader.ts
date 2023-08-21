import { StoryQuestion } from "./story_question";

/**
 * Read StoryQuestion.
 */
export interface StoryQuestionReader {
  readAll(): Promise<StoryQuestion[]>;
}
