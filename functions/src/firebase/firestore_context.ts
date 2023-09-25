import { Firestore, getFirestore } from "firebase-admin/firestore";

import {
  FirestoreStoryCache,
  FirestoreStoryRealtime,
  FirestoreStoryForms,
  FirestoreStoryQuestions,
} from "./story";
import {
  FirestoreUserFeedback,
  FirestoreUserStats,
  FirestoreUserStories,
} from "./user";

// The default collection paths.
const STORY_CACHE_LANDING = "story__cache_landing";
const STORY_CACHE_SERVING = "story__cache_serving";
const STORY_FORMS_LANDING = "story__forms_landing";
const STORY_FORMS_SERVING = "story__forms_serving";
const STORY_QUESTIONS = "story__questions";
const STORY_QUESTIONS_SERVING = "story__questions_serving";
const STORY_REALTIME = "story__realtime";
const USER_FEEDBACK = "user__feedback";
const USER_STATS = "user__stats";
const USER_STORIES = "user__stories";

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
  readonly storyCacheLanding: FirestoreStoryCache;
  readonly storyCacheServing: FirestoreStoryCache;
  readonly storyFormsLanding: FirestoreStoryForms;
  readonly storyFormsServing: FirestoreStoryForms;
  readonly storyQuestions: FirestoreStoryQuestions;
  readonly storyQuestionsServing: FirestoreStoryQuestions;
  readonly storyRealtime: FirestoreStoryRealtime;
  readonly userFeedback: FirestoreUserFeedback;
  readonly userStats: FirestoreUserStats;
  readonly userStories: FirestoreUserStories;

  constructor(prefix?: string, private firestore?: Firestore) {
    const p = prefix === undefined ? "" : `${prefix}__`;

    this.storyCacheLanding = new FirestoreStoryCache(
      p + STORY_CACHE_LANDING,
      this
    );
    this.storyCacheServing = new FirestoreStoryCache(
      p + STORY_CACHE_SERVING,
      this
    );
    this.storyFormsLanding = new FirestoreStoryForms(
      p + STORY_FORMS_LANDING,
      this
    );
    this.storyFormsServing = new FirestoreStoryForms(
      p + STORY_FORMS_SERVING,
      this
    );
    this.storyQuestions = new FirestoreStoryQuestions(
      p + STORY_QUESTIONS,
      this
    );
    this.storyQuestionsServing = new FirestoreStoryQuestions(
      p + STORY_QUESTIONS_SERVING,
      this
    );
    this.storyRealtime = new FirestoreStoryRealtime(p + STORY_REALTIME, this);
    this.userFeedback = new FirestoreUserFeedback(p + USER_FEEDBACK, this);
    this.userStats = new FirestoreUserStats(p + USER_STATS, this);
    this.userStories = new FirestoreUserStories(p + USER_STORIES, this);
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
