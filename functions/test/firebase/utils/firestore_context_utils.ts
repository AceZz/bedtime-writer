import { FirestoreContext } from "../../../src/firebase";
import {
  FirestoreStoryFormsUtils,
  FirestoreStoryQuestionsUtils,
  FirestoreStoriesUtils,
  FirestoreUserFeedbackUtils,
  FirestoreUserStatsUtils,
  FirestoreUserStoriesUtils,
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

  storyCacheLanding: FirestoreStoriesUtils;
  storyForms: FirestoreStoryFormsUtils;
  storyQuestions: FirestoreStoryQuestionsUtils;
  storyRealtime: FirestoreStoriesUtils;
  userFeedback: FirestoreUserFeedbackUtils;
  userStats: FirestoreUserStatsUtils;
  userStories: FirestoreUserStoriesUtils;

  constructor(readonly id: string) {
    this.firestore = new FirestoreContext(`test_${id}`);

    this.storyCacheLanding = new FirestoreStoriesUtils(
      this.firestore.storyCacheLanding.collectionPath,
      this.firestore
    );
    this.storyForms = new FirestoreStoryFormsUtils(
      this.firestore.storyFormsLanding.collectionPath,
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
    this.userStats = new FirestoreUserStatsUtils(
      this.firestore.userStats.collectionPath,
      this.firestore
    );
    this.userStories = new FirestoreUserStoriesUtils(
      this.firestore.userStories.collectionPath,
      this.firestore
    );
  }
}
