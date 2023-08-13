import {
  FirestoreStoryCache,
  FirestoreStoryRealtime,
} from "./firestore_stories";
import { FirestoreStoryForms } from "./firestore_story_forms";
import { FirestoreStoryQuestions } from "./firestore_story_questions";
import { FirestoreUserFeedback } from "./firestore_user_feedback";

// The default collection paths.
const STORY_CACHE = "story__cache";
const STORY_FORMS = "story__forms";
const STORY_QUESTIONS = "story__questions";
const STORY_REALTIME = "story__realtime";
const USER_FEEDBACK = "user__feedback";

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
  readonly storyCache: FirestoreStoryCache;
  readonly storyForms: FirestoreStoryForms;
  readonly storyQuestions: FirestoreStoryQuestions;
  readonly storyRealtime: FirestoreStoryRealtime;
  readonly userFeedback: FirestoreUserFeedback;

  constructor(prefix?: string) {
    const p = prefix === undefined ? "" : `${prefix}__`;

    this.storyCache = new FirestoreStoryCache(`${p}${STORY_CACHE}`);
    this.storyForms = new FirestoreStoryForms(`${p}${STORY_FORMS}`);
    this.storyQuestions = new FirestoreStoryQuestions(`${p}${STORY_QUESTIONS}`);
    this.storyRealtime = new FirestoreStoryRealtime(`${p}${STORY_REALTIME}`);
    this.userFeedback = new FirestoreUserFeedback(`${p}${USER_FEEDBACK}`);
  }
}
