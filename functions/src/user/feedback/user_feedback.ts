/**
 * Interface to manage user feedback.
 */
export interface UserFeedbackManager {
  /**
   * Write the user feedback to the database.
   */
  write(feedback: UserFeedback): Promise<void>;
}

export class UserFeedback {
  constructor(
    readonly text: string,
    readonly datetime: Date,
    readonly uid: string | undefined
  ) {}

  toJson(): object {
    return { ...this };
  }
}
