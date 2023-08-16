import { FirestoreContext } from "../../../src/firebase";
import {
  FirestoreStoryFormsUtils,
  FirestoreStoryQuestionsUtils,
  FirestoreStoriesUtils,
  FirestoreStoryCacheUtils,
  FirestoreUserFeedbackUtils,
} from ".";

/**
 * Helper class to interact with the Firestore database.
 *
 * Give it an ID to identify your test uniquely. This makes sure that tests
 * running concurrently do not conflict with each other (as far as the database
 * is concerned).
 */
export class FirestoreContextUtils {
  firestore: FirestoreContext;

  storyCache: FirestoreStoryCacheUtils;
  storyForms: FirestoreStoryFormsUtils;
  storyQuestions: FirestoreStoryQuestionsUtils;
  storyRealtime: FirestoreStoriesUtils;
  userFeedback: FirestoreUserFeedbackUtils;

  constructor(readonly id: string) {
    this.firestore = new FirestoreContext(`test_${id}`);

    this.storyCache = new FirestoreStoryCacheUtils(
      this.firestore.storyCache.collectionPath,
      this.firestore
    );
    this.storyForms = new FirestoreStoryFormsUtils(
      this.firestore.storyForms.collectionPath,
      this.firestore
    );
    this.storyQuestions = new FirestoreStoryQuestionsUtils(
      this.firestore.storyQuestions.collectionPath,
      this.firestore
    );
    this.storyRealtime = new FirestoreStoriesUtils(
      this.firestore.storyRealtime.collectionPath,
      this.firestore
    );
    this.userFeedback = new FirestoreUserFeedbackUtils(
      this.firestore.userFeedback.collectionPath,
      this.firestore
    );
  }
}
