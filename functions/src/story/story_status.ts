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

export function parseStoryStatus(value: string): StoryStatus {
  switch (value) {
    case "pending":
      return StoryStatus.PENDING;
    case "generating":
      return StoryStatus.GENERATING;
    case "complete":
      return StoryStatus.COMPLETE;
    case "error":
      return StoryStatus.ERROR;
    default:
      throw new Error(`parseStoryStatus: unrecognized value ${value}`);
  }
}
