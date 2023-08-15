import { FirestoreContext } from "../../../src/firebase";
import { FirestoreCacheTestUtils } from "./firestore_cache_test_utils";
import { FirestoreFormsTestUtils } from "./firestore_forms_test_utils";
import { FirestoreStoryQuestionsUtils } from "../../firebase/utils/firestore_story_questions_utils";
import { FirestoreStoryTestUtils } from "./firestore_story_test_utils";

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
  forms: FirestoreFormsTestUtils;
  story: FirestoreStoryTestUtils;
  cache: FirestoreCacheTestUtils;

  constructor(readonly id: string) {
    this.firestore = new FirestoreContext(`test_${id}`);
    this.questions = new FirestoreStoryQuestionsUtils(
      this.firestore.storyQuestions.collectionPath,
      this.firestore
    );
    this.forms = new FirestoreFormsTestUtils(
      this.firestore.storyForms.collectionPath,
      this.firestore
    );
    this.story = new FirestoreStoryTestUtils(this.firestore.storyRealtime);
    this.cache = new FirestoreCacheTestUtils(this.firestore.storyCache);
  }
}
