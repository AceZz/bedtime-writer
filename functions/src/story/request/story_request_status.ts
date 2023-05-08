export enum StoryRequestStatus {
  /**
   * The request is pending.
   */
  PENDING = "pending",
  /**
   * The request succeeded, and the story was created.
   *
   * Note: this does not necessarily mean that the story is complete.
   */
  CREATED = "created",
  /**
   * The request failed.
   */
  ERROR = "error",
}
