/**
 * This class unifies the names of the Firestore collections, taking a prefix as
 * an input.
 */
export class FirestorePaths {
  story: FirestoreStoryPaths;

  constructor(private readonly prefix?: string) {
    this.story = new FirestoreStoryPaths(this.prefix);
  }
}

class FirestoreStoryPaths {
  private static BASE_FORMS = "story__forms";
  private static BASE_QUESTIONS = "story__questions";
  private static BASE_CACHE = "story__cache";
  private static BASE_REALTIME = "story__realtime";
  forms: string;
  questions: string;
  cache: string;
  realtime: string;

  constructor(private readonly prefix?: string) {
    this.forms =
      this.prefix === undefined
        ? FirestoreStoryPaths.BASE_FORMS
        : `${this.prefix}__${FirestoreStoryPaths.BASE_FORMS}`;

    this.questions =
      this.prefix === undefined
        ? FirestoreStoryPaths.BASE_QUESTIONS
        : `${this.prefix}__${FirestoreStoryPaths.BASE_QUESTIONS}`;

    this.cache =
      this.prefix === undefined
        ? FirestoreStoryPaths.BASE_CACHE
        : `${this.prefix}__${FirestoreStoryPaths.BASE_CACHE}`;

    this.realtime =
      this.prefix === undefined
        ? FirestoreStoryPaths.BASE_REALTIME
        : `${this.prefix}__${FirestoreStoryPaths.BASE_REALTIME}`;
  }
}
