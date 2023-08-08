/**
 * This class unifies the names of the Firestore collections, taking a prefix as
 * an input.
 */
export class FirestorePaths {
  story: FirestoreStoryPaths;
  user: FirestoreUserPaths;

  constructor(private readonly prefix?: string) {
    this.story = new FirestoreStoryPaths(this.prefix);
    this.user = new FirestoreUserPaths(this.prefix);
  }
}

class FirestoreStoryPaths {
  private static BASE_CACHE = "story__cache";
  private static BASE_FORMS = "story__forms";
  private static BASE_QUESTIONS = "story__questions";
  private static BASE_REALTIME = "story__realtime";
  cache: string;
  forms: string;
  questions: string;
  realtime: string;

  constructor(private readonly prefix?: string) {
    this.cache =
      this.prefix === undefined
        ? FirestoreStoryPaths.BASE_CACHE
        : `${this.prefix}__${FirestoreStoryPaths.BASE_CACHE}`;

    this.forms =
      this.prefix === undefined
        ? FirestoreStoryPaths.BASE_FORMS
        : `${this.prefix}__${FirestoreStoryPaths.BASE_FORMS}`;

    this.questions =
      this.prefix === undefined
        ? FirestoreStoryPaths.BASE_QUESTIONS
        : `${this.prefix}__${FirestoreStoryPaths.BASE_QUESTIONS}`;

    this.realtime =
      this.prefix === undefined
        ? FirestoreStoryPaths.BASE_REALTIME
        : `${this.prefix}__${FirestoreStoryPaths.BASE_REALTIME}`;
  }
}

class FirestoreUserPaths {
  private static BASE_FEEDBACK = "user__feedback";
  feedback: string;

  constructor(private readonly prefix?: string) {
    this.feedback =
      this.prefix === undefined
        ? FirestoreUserPaths.BASE_FEEDBACK
        : `${this.prefix}__${FirestoreUserPaths.BASE_FEEDBACK}`;
  }
}
