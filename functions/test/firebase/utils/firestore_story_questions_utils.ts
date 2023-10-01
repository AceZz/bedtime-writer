import { DocumentReference } from "firebase-admin/firestore";
import { StoryQuestion, StoryChoice } from "../../../src/story";
import { expect } from "@jest/globals";
import { FirestoreStoryQuestions } from "../../../src/firebase";

/**
 * Helper class to interact with the story questions Firestore collection.
 */
export class FirestoreStoryQuestionsUtils extends FirestoreStoryQuestions {
  /**
   * Compare `StoryQuestion` objects against the content of the Firestore
   * database.
   *
   * Firebase must be initialized before calling this function.
   */
  async expectQuestionsToBe(expected: StoryQuestion[]) {
    // Test each question.
    await Promise.all(
      expected.map((expectedQuestion) =>
        this.expectQuestionToBe(
          this.questionsRef().doc(expectedQuestion.id),
          expectedQuestion
        )
      )
    );

    // Test the number of questions.
    const countQuery = await this.questionsRef().count().get();
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
      Array.from(expected.choices.values()).map((expectedChoice) =>
        this.expectChoiceToBe(choices.doc(expectedChoice.id), expectedChoice)
      )
    );

    // Test the number of choices.
    const countQuery = await choices.count().get();
    expect(countQuery.data().count).toBe(expected.choices.size);
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
