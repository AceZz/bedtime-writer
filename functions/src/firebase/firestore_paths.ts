import { Firestore, getFirestore } from "firebase-admin/firestore";

import {
  FirestoreStoryCache,
  FirestoreStoryRealtime,
} from "./firestore_stories";
import { FirestoreStoryForms } from "./firestore_story_forms";
import { FirestoreStoryQuestions } from "./firestore_story_questions";
import { FirestoreUserFeedback } from "./firestore_user_feedback";
import { FirestoreUserStats } from "./firestore_user_stats";

// The default collection paths.
const STORY_CACHE = "story__cache";
const STORY_FORMS = "story__forms";
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
 * and / or writer. Firebase MUST BE initialized before initializing this class.
 */
export class FirestorePaths {
  private readonly firestore: Firestore;
  readonly storyCache: FirestoreStoryCache;
  readonly storyForms: FirestoreStoryForms;
  readonly storyQuestions: FirestoreStoryQuestions;
  readonly storyRealtime: FirestoreStoryRealtime;
  readonly userFeedback: FirestoreUserFeedback;
  readonly userStats: FirestoreUserStats;

  constructor(prefix?: string, firestore?: Firestore) {
    this.firestore = firestore ?? getFirestore();

    const p = prefix === undefined ? "" : `${prefix}__`;

    this.storyCache = new FirestoreStoryCache(p + STORY_CACHE, this.firestore);
    this.storyForms = new FirestoreStoryForms(p + STORY_FORMS, this.firestore);
    this.storyQuestions = new FirestoreStoryQuestions(
      p + STORY_QUESTIONS,
      this.firestore
    );
    this.storyRealtime = new FirestoreStoryRealtime(
      p + STORY_REALTIME,
      this.firestore
    );
    this.userFeedback = new FirestoreUserFeedback(
      p + USER_FEEDBACK,
      this.firestore
    );
    this.userStats = new FirestoreUserStats(p + USER_STATS, this.firestore);
  }
}
