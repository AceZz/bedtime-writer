import { FirestoreContext } from "../../../src/firebase";
import {
  FirestoreStoryFormsUtils,
  FirestoreStoryQuestionsUtils,
  FirestoreStoriesUtils,
} from "../../firebase/utils";
import { FirestoreCacheTestUtils } from "./firestore_cache_test_utils";

/**
 * Helper class to interact with the Firestore database.
 *
 * Give it an ID to identify your test uniquely. This makes sure that tests
 * running concurrently do not conflict with each other (as far as the database
 * is concerned).
 */
export class FirestoreTestUtils {
  firestore: FirestoreContext;
  questions: FirestoreStoryQuestionsUtils;
  forms: FirestoreStoryFormsUtils;
  story: FirestoreStoriesUtils;
  cache: FirestoreCacheTestUtils;

  constructor(readonly id: string) {
    this.firestore = new FirestoreContext(`test_${id}`);
    this.questions = new FirestoreStoryQuestionsUtils(
      this.firestore.storyQuestions.collectionPath,
      this.firestore
    );
    this.forms = new FirestoreStoryFormsUtils(
      this.firestore.storyForms.collectionPath,
      this.firestore
    );
    this.story = new FirestoreStoriesUtils(
      this.firestore.storyRealtime.collectionPath,
      this.firestore
    );
    this.cache = new FirestoreCacheTestUtils(this.firestore.storyCache);
  }
}
