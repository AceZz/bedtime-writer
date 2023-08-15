import { DocumentReference, getFirestore } from "firebase-admin/firestore";
import { StoryQuestion, StoryChoice } from "../../../src/story";
import { expect } from "@jest/globals";
import { FirestoreStoryQuestions } from "../../../src/firebase";

/**
 * Helper class to interact with the story questions Firestore collection.
 */
export class FirestoreQuestionsTestUtils extends FirestoreStoryQuestions {
  /**
   * Delete the collection.
   *
   * Firebase must be initialized before calling this function.
   */
  async delete(): Promise<void> {
    const firestore = getFirestore();
    const questions = await firestore.collection(this.collectionPath).get();
    await Promise.all(
      questions.docs.map((question) => this.deleteQuestion(question.ref))
    );
  }

  private async deleteQuestion(question: DocumentReference): Promise<void> {
    await this.deleteChoices(question);
    await question.delete();
  }

  private async deleteChoices(question: DocumentReference): Promise<void> {
    const choices = await question.collection("choices").get();
    await Promise.all(
      choices.docs.map((choice) => {
        choice.ref.delete();
      })
    );
  }

  /**
   * Compare `StoryQuestion` objects against the content of the Firestore
   * database.
   *
   * Firebase must be initialized before calling this function.
   */
  async expectQuestionsToBe(expected: StoryQuestion[]) {
    const firestore = getFirestore();
    const questions = firestore.collection(this.collectionPath);

    // Test each question.
    await Promise.all(
      expected.map((expectedQuestion) =>
        this.expectQuestionToBe(
          questions.doc(expectedQuestion.id),
          expectedQuestion
        )
      )
    );

    // Test the number of questions.
    const countQuery = await questions.count().get();
    expect(countQuery.data().count).toBe(expected.length);
  }

  private async expectQuestionToBe(
    document: DocumentReference,
    expected: StoryQuestion
  ) {
    // Test the question's data.
    const data = (await document.get()).data();
    expect(data?.text).toBe(expected.text);

    // Test each choice.
    const choices = document.collection("choices");
    await Promise.all(
      expected.choices.map((expectedChoice) =>
        this.expectChoiceToBe(choices.doc(expectedChoice.id), expectedChoice)
      )
    );

    // Test the number of choices.
    const countQuery = await choices.count().get();
    expect(countQuery.data().count).toBe(expected.choices.length);
  }

  private async expectChoiceToBe(
    document: DocumentReference,
    expected: StoryChoice
  ) {
    const data = (await document.get()).data();
    expect(data?.image).toStrictEqual(expected.image);
    expect(data?.text).toBe(expected.text);
  }
}
