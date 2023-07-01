/**
 * Stores questions and choices that should be displayed to the user.
 *
 * `questions` maps a question ID to choices IDs.
 */
export class StoryForm {
  readonly start: Date;

  constructor(readonly questions: Map<string, string[]>, start?: Date) {
    this.start = start ?? new Date();
  }
}
