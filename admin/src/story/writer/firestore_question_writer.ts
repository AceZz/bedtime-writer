import { Question } from "../question";
import { Writer } from "./writer";
import { StoryChoice } from "../story_choice";
import { FirestoreStoryQuestions } from "../../firebase/firestore_story_questions";
import { FirestorePaths } from "../../firebase/firestore_paths";

/**
 * This class writes a list of Question objects to a Firestore database.
 *
 * The Firestore collection follows this schema:
 *
 * ```plain
 * story__questions/
 *   <question_id>:
 *     text: str
 *
 *     choices/
 *       <choice_id>:
 *         text: str
 *         image: bytes
 * ```
 *
 * Note: we make the requests one by one. This is far from being the most
 * efficient, as the Firestore documentation recommends to parallelize writes.
 * However, we had random bugs with this approach. As this tool does not need to
 * be fast, we thus chose to do sequential writes.
 */
export class FirestoreQuestionWriter implements Writer<Question[]> {
  private collection: FirestoreStoryQuestions;

  constructor(paths?: FirestorePaths) {
    this.collection = new FirestoreStoryQuestions(paths);
  }

  /**
   * Write `questions` to the Firestore database.
   *
   * After the operation, the database contains exactly the same data as what
   * was provided. In other words, any data not in `questions` is removed.
   */
  async write(questions: Question[]): Promise<void> {
    await this.removeExtraQuestions(questions);

    for (const question of questions) {
      await this.writeQuestion(question);
    }
  }

  async removeExtraQuestions(questions: Question[]): Promise<void> {
    const questionIds = questions.map((question) => question.id);
    const snapshot = await this.collection.questionsRef().get();

    // Delete every document which ID is not in `questionIds` (i.e. not in
    // `questions`).
    await Promise.all(
      snapshot.docs
        .filter((doc) => !questionIds.includes(doc.id))
        .map((doc) => doc.ref.delete())
    );
  }

  async writeQuestion(question: Question): Promise<void> {
    await this.collection.questionRef(question.id).set({ text: question.text });
    await this.removeExtraChoices(question);

    for (const choice of question.choices) {
      await this.writeChoice(question.id, choice);
    }
  }

  async removeExtraChoices(question: Question): Promise<void> {
    const choiceIds = question.choices.map((choice) => choice.id);
    const snapshot = await this.collection.choicesRef(question.id).get();

    // Delete every document which ID is not in `choiceIds` (i.e. not in
    // `question`).
    await Promise.all(
      snapshot.docs
        .filter((doc) => !choiceIds.includes(doc.id))
        .map((doc) => doc.ref.delete())
    );
  }

  async writeChoice(questionId: string, choice: StoryChoice): Promise<void> {
    await this.collection.choiceRef(questionId, choice.id).set({
      text: choice.text,
      image: choice.image,
    });
  }
}
