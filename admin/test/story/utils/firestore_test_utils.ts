import { FirestoreFormsTestUtils } from "./firestore_forms_test_utils";
import { FirestoreQuestionsTestUtils } from "./firestore_questions_test_utils";

/**
 * Helper class to interact with the Firestore database.
 *
 * Give it an ID to identify your test uniquely. This makes sure that tests
 * running concurrently do not conflict with each other (as far as the database
 * is concerned).
 */
export class FirestoreTestUtils {
  prefix: string;
  questions: FirestoreQuestionsTestUtils;
  forms: FirestoreFormsTestUtils;

  constructor(readonly id: string) {
    this.prefix = `test_${id}`;
    this.questions = new FirestoreQuestionsTestUtils(this.prefix);
    this.forms = new FirestoreFormsTestUtils(this.prefix);
  }
}
