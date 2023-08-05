import {
  CollectionReference,
  DocumentReference,
  Firestore,
  getFirestore,
} from "firebase-admin/firestore";
import { FirestorePaths } from "./firestore_paths";
import { FirestoreStories } from "./firestore_stories";

/**
 * Helper class to manipulate the story cache collection. It follows this
 * schema:
 *
 * ```plain
 * story__cache:
 *     <story_1>:
 *        ...
 *        request {}
 *     <story_2>:
 *        ...
 *     ...
 *   ...
 * ```
 */
export class FirestoreStoryCache implements FirestoreStories {
  private firestore: Firestore;

  constructor(readonly paths = new FirestorePaths(), firestore?: Firestore) {
    this.firestore = firestore ?? getFirestore();
  }

  storyRef(id: string): DocumentReference {
    return this.storiesRef().doc(id);
  }

  storiesRef(): CollectionReference {
    return this.firestore.collection(this.paths.story.cache);
  }

  async deleteStory(id: string): Promise<void> {
    await this.storiesRef().doc(id).delete();
  }

  /**
   * Get all stories corresponding to the formId, even if incomplete or
   * erroneous.
   */
  async getFormIdStories(
    formId: string
  ): Promise<FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>> {
    return await this.storiesRef().where("request.formId", "==", formId).get();
  }

  /**
   * Get all stories corresponding to the formResponse, filtering by the story
   * status only if provided.
   */
  async getFormResponseStories(
    formId: string,
    questions: string[],
    formResponse: string[],
    status?: string
  ): Promise<FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>> {
    if (questions.length != formResponse.length) {
      throw new Error(
        "getFormResponseStories: questions and formReponse have different lengths."
      );
    }
    let query = this.storiesRef().where("request.formId", "==", formId);
    questions.forEach((question, i) => {
      query = query.where(`request.${question}`, "==", formResponse[i]);
    });
    if (status !== undefined) {
      query = query.where("status", "==", status);
    }
    return await this.storiesRef().where("request.formId", "==", formId).get();
  }
}
