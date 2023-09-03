import {
  CopierParams,
  StoryQuestionCopier,
  StoryQuestionFilter,
} from "../../../story";
import { dumpToCollection } from "../../firestore_utils";
import { FirebaseStoryQuestionReader } from "./firebase_story_question_reader";
import { FirestoreStoryQuestions } from "./firestore_story_questions";

export class FirebaseStoryQuestionCopier<
  T extends { [key: string]: any }
> extends StoryQuestionCopier<T> {
  private reader: FirebaseStoryQuestionReader;

  constructor(
    protected readonly itemFilter: StoryQuestionFilter<T>,
    private readonly origin: FirestoreStoryQuestions,
    private readonly dest: FirestoreStoryQuestions
  ) {
    super();
    this.reader = new FirebaseStoryQuestionReader(this.origin);
  }

  async copy(params?: CopierParams | undefined): Promise<void> {
    const questions = await this.reader.get(params);
    const raw = this.filterItems(questions);
    await dumpToCollection(this.dest, raw);
  }
}
