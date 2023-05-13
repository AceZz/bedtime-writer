export enum StoryStatus {
  /**
   * The story was requested, but generation has not started.
   */
  PENDING = "pending",
  /**
   * At least one part of the story is available, but the story is not complete.
   */
  GENERATING = "generating",
  /**
   * Story was fully generated.
   */
  COMPLETE = "complete",
  /**
   * The request failed.
   */
  ERROR = "error",
}
