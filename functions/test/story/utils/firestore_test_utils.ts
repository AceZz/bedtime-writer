import { FirestorePaths } from "../../../src/firebase/firestore_paths";
import { FirestoreFormsTestUtils } from "./firestore_forms_test_utils";
import { FirestoreQuestionsTestUtils } from "./firestore_questions_test_utils";
import { FirestoreStoryTestUtils } from "./firestore_story_test_utils";

/**
 * Helper class to interact with the Firestore database.
 *
 * Give it an ID to identify your test uniquely. This makes sure that tests
 * running concurrently do not conflict with each other (as far as the database
 * is concerned).
 */
export class FirestoreTestUtils {
  paths: FirestorePaths;
  questions: FirestoreQuestionsTestUtils;
  forms: FirestoreFormsTestUtils;
  story: FirestoreStoryTestUtils;

  constructor(readonly id: string) {
    this.paths = new FirestorePaths(`test_${id}`);
    this.questions = new FirestoreQuestionsTestUtils(this.paths);
    this.forms = new FirestoreFormsTestUtils(this.paths);
    this.story = new FirestoreStoryTestUtils(this.paths);
  }
}
