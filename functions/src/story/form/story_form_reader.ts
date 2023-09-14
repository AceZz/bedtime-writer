import { StoryForm } from "./story_form";

export type StoryFormReaderParams = {
  ids?: string[] | undefined;
  isCached?: boolean | undefined;
  isApproved?: boolean | undefined;
};

/**
 * Read `StoryForm`s.
 */
export interface StoryFormReader {
  /**
   * If `ids` is `undefined`, return all the forms.
   * If `isCached` is not `undefined`, filter by generation status.
   * If `isApproved` is not `undefined`, filter by approval status.
   */
  get(params?: StoryFormReaderParams): Promise<Map<string, StoryForm>>;

  /**
   * Same parameters as `get()`.
   */
  getIds(params?: StoryFormReaderParams): Promise<string[]>;
}
