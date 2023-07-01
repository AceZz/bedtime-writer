import { DocumentReference, getFirestore } from "firebase-admin/firestore";
import { FirebaseQuestionWriter } from "../../../src/story";
import { FirestoreQuestionReader } from "../../../src/story/reader/firestore_question_reader";
import { StoryQuestion } from "../../../src/story/story_question";
import { StoryChoice } from "../../../src/story/story_choice";
import { expect } from "@jest/globals";
import { FirestorePaths } from "../../../src/firebase/firestore_paths";

const QUESTIONS_0 = async () => [
  new StoryQuestion("question1", "Question 1", [
    await StoryChoice.fromImagePath(
      "choice1",
      "Choice 1",
      "test/story/data/choice.jpg"
    ),
    await StoryChoice.fromImagePath(
      "choice2",
      "Choice 2",
      "test/story/data/choice.jpg"
    ),
  ]),
  new StoryQuestion("question2", "Question 2", [
    await StoryChoice.fromImagePath(
      "choice1",
      "Choice 1",
      "test/story/data/choice.jpg"
    ),
    await StoryChoice.fromImagePath(
      "choice2",
      "Choice 2",
      "test/story/data/choice.jpg"
    ),
  ]),
];

// same as `questions_0`, but:
// * `question_1` has another text, one of its choices was modified, one of its
//   choices was replaced by another
// * `question2` was replaced by `question3`

const QUESTIONS_1 = async () => [
  new StoryQuestion("question1", "New question 1", [
    await StoryChoice.fromImagePath(
      "choice1",
      "New choice 1",
      "test/story/data/choice.jpg"
    ),
    await StoryChoice.fromImagePath(
      "choice3",
      "Choice 3",
      "test/story/data/choice.jpg"
    ),
  ]),
  new StoryQuestion("question3", "Question 3", [
    await StoryChoice.fromImagePath(
      "choice1",
      "Choice 1",
      "test/story/data/choice.jpg"
    ),
    await StoryChoice.fromImagePath(
      "choice2",
      "Choice 2",
      "test/story/data/choice.jpg"
    ),
  ]),
];

/**
 * Helper class to interact with the story questions Firestore collection.
 */
export class FirestoreQuestionsTestUtils {
  constructor(readonly paths: FirestorePaths) {}

  get writer(): FirebaseQuestionWriter {
    return new FirebaseQuestionWriter(this.paths);
  }

  get reader(): FirestoreQuestionReader {
    return new FirestoreQuestionReader(this.paths);
  }

  async samples(): Promise<StoryQuestion[][]> {
    return Promise.all([QUESTIONS_0(), QUESTIONS_1()]);
  }

  /**
   * Delete the collection.
   *
   * Firebase must be initialized before calling this function.
   */
  async deleteCollection(): Promise<void> {
    const firestore = getFirestore();
    const questions = await firestore
      .collection(this.paths.story.questions)
      .get();
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
    const questions = firestore.collection(this.paths.story.questions);

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
