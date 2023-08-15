import { StoryQuestion } from "../story_question";
import { Writer } from "./writer";
import { StoryChoice } from "../story_choice";
import { FirestoreStoryQuestions } from "../../../firebase";

/**
 * This class writes a list of StoryQuestion objects to Firebase.
 *
 * Note: we make the requests one by one. This is far from being the most
 * efficient, as the Firestore documentation recommends to parallelize writes.
 * However, we had random bugs with this approach. As this tool does not need to
 * be fast, we thus chose to do sequential writes.
 */
export class FirebaseQuestionWriter implements Writer<StoryQuestion[]> {
  constructor(private readonly collection: FirestoreStoryQuestions) {}

  /**
   * Write `questions` to the Firestore database.
   *
   * After the operation, the database contains exactly the same data as what
   * was provided. In other words, any data not in `questions` is removed.
   */
  async write(questions: StoryQuestion[]): Promise<void> {
    await this.removeExtraQuestions(questions);

    for (const question of questions) {
      await this.writeQuestion(question);
    }
  }

  async removeExtraQuestions(questions: StoryQuestion[]): Promise<void> {
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

  async writeQuestion(question: StoryQuestion): Promise<void> {
    await this.collection.questionRef(question.id).set({
      promptParam: question.promptParam,
      text: question.text,
      priority: question.priority,
      datetime: question.datetime,
    });
    await this.removeExtraChoices(question);

    for (const choice of question.choices.values()) {
      await this.writeChoice(question.id, choice);
    }
  }

  async removeExtraChoices(question: StoryQuestion): Promise<void> {
    const choiceIds = question.choiceIds;
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
      prompt: choice.prompt,
      image: choice.image,
    });
  }
}
