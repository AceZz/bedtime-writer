/**
 * Interface to manage user feedback.
 */
export interface UserFeedbackManager {
  /**
   * Write the user feedback to the database.
   *
   * Returns the feedback id.
   */
  write(feedback: UserFeedback): Promise<string>;
}

export class UserFeedback {
  constructor(
    readonly text: string,
    readonly createdAt: Date,
    readonly uid: string | undefined
  ) {}

  toJson(): object {
    return { ...this };
  }
}
