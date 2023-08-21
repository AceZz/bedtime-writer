import { Firestore, getFirestore } from "firebase-admin/firestore";

import {
  FirestoreStoryCache,
  FirestoreStoryRealtime,
  FirestoreStoryForms,
  FirestoreStoryQuestions,
} from "./story";
import { FirestoreUserFeedback, FirestoreUserStats } from "./user";

// The default collection paths.
const STORY_CACHE = "story__cache";
const STORY_FORMS_LANDING = "story__forms_landing";
const STORY_QUESTIONS = "story__questions";
const STORY_REALTIME = "story__realtime";
const USER_FEEDBACK = "user__feedback";
const USER_STATS = "user__stats";

/**
 * This class configures and stores all the Firestore helper classes that
 * manipulate collections. You can think of it as a "context" for everything
 * Firestore: a single instance of this class is guaranteed to provide
 * consistent document and reference paths.
 *
 * You can specify a common prefix that should be put before all collection
 * paths. This is especially useful for tests (it allows doing as if each test
 * or group of tests had its own Firestore).
 *
 * As a rule of thumb, every time you find yourself hard-coding a Firestore
 * reference outside the `firebase` package, you should rather use this
 * class and its attributes (create the appropriate helper if needed).
 *
 * Use this class by instantiating it in the caller (Firebase functions, admin
 * scripts…) and passing the appropriate helper(s) to the Firestore reader
 * and / or writer.
 */
export class FirestoreContext {
  readonly storyCache: FirestoreStoryCache;
  readonly storyFormsLanding: FirestoreStoryForms;
  readonly storyQuestions: FirestoreStoryQuestions;
  readonly storyRealtime: FirestoreStoryRealtime;
  readonly userFeedback: FirestoreUserFeedback;
  readonly userStats: FirestoreUserStats;

  constructor(prefix?: string, private firestore?: Firestore) {
    const p = prefix === undefined ? "" : `${prefix}__`;

    this.storyCache = new FirestoreStoryCache(p + STORY_CACHE, this);
    this.storyFormsLanding = new FirestoreStoryForms(
      p + STORY_FORMS_LANDING,
      this
    );
    this.storyQuestions = new FirestoreStoryQuestions(
      p + STORY_QUESTIONS,
      this
    );
    this.storyRealtime = new FirestoreStoryRealtime(p + STORY_REALTIME, this);
    this.userFeedback = new FirestoreUserFeedback(p + USER_FEEDBACK, this);
    this.userStats = new FirestoreUserStats(p + USER_STATS, this);
  }

  /**
   * Implement the `FirestoreProvider` interface found in
   * `firestore_collection`. This mechanism allows the lazy-loading of
   * Firestore. Otherwise, Firebase has to be initialized before
   * `FirestoreContext` is initialized, which is impractical.
   */
  getFirestore(): Firestore {
    if (this.firestore === undefined) this.firestore = getFirestore();
    return this.firestore;
  }
}
