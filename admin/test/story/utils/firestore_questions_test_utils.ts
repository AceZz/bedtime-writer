import { DocumentReference, getFirestore } from "firebase-admin/firestore";
import { FirestoreQuestionWriter } from "../../../src/story";
import { Question } from "../../../src/story/question";
import { Choice } from "../../../src/story/choice";
import { expect } from "@jest/globals";

const QUESTIONS_0 = [
  new Question("question1", "Question 1", [
    new Choice("choice1", "Choice 1", "test/story/data/choice.jpg"),
    new Choice("choice2", "Choice 2", "test/story/data/choice.jpg"),
  ]),
  new Question("question2", "Question 2", [
    new Choice("choice1", "Choice 1", "test/story/data/choice.jpg"),
    new Choice("choice2", "Choice 2", "test/story/data/choice.jpg"),
  ]),
];

// same as `questions_0`, but:
// * `question_1` has another text, one of its choices was modified, one of its
//   choices was replaced by another
// * `question2` was replaced by `question3`

const QUESTIONS_1 = [
  new Question("question1", "New question 1", [
    new Choice("choice1", "New choice 1", "test/story/data/choice.jpg"),
    new Choice("choice3", "Choice 3", "test/story/data/choice.jpg"),
  ]),
  new Question("question3", "Question 3", [
    new Choice("choice1", "Choice 1", "test/story/data/choice.jpg"),
    new Choice("choice2", "Choice 2", "test/story/data/choice.jpg"),
  ]),
];

/**
 * Helper class to interact with the story questions Firestore collection.
 */
export class FirestoreQuestionsTestUtils {
  collectionName: string;
  samples: Question[][];

  constructor(readonly prefix: string) {
    this.collectionName = `${this.prefix}__story__questions`;
    this.samples = [QUESTIONS_0, QUESTIONS_1];
  }

  get writer(): FirestoreQuestionWriter {
    return new FirestoreQuestionWriter(this.collectionName);
  }

  /**
   * Delete the collection.
   *
   * Firebase must be initialized before calling this function.
   */
  async deleteCollection(): Promise<void> {
    const firestore = getFirestore();
    const questions = await firestore.collection(this.collectionName).get();
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
   * Compare `Question` objects against the content of the Firestore database.
   *
   * Firebase must be initialized before calling this function.
   */
  async expectQuestionsToBe(expected: Question[]) {
    const firestore = getFirestore();
    const questions = firestore.collection(this.collectionName);

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
    expected: Question
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
    expected: Choice
  ) {
    const data = (await document.get()).data();
    expect(data?.image).toStrictEqual(await expected.image());
    expect(data?.text).toBe(expected.text);
  }
}
