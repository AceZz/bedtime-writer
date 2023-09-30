import { StoryQuestion } from "./story_question";

export type StoryQuestionReaderParams = {
  ids?: string[];
};

/**
 * Read `StoryQuestion`s.
 */
export interface StoryQuestionReader {
  /**
   * If `ids` is `undefined`, return all the questions.
   */
  get(params?: StoryQuestionReaderParams): Promise<Map<string, StoryQuestion>>;
}
