import {
  CopierParams,
  StoryQuestionCopier,
  StoryQuestionFilter,
} from "../../../story";
import { dumpToCollection } from "../../firestore_utils";
import { FirestoreStoryQuestions } from "./firestore_story_questions";

export class FirebaseStoryQuestionCopier<
  T extends { [key: string]: any }
> extends StoryQuestionCopier<T> {
  constructor(
    protected readonly itemFilter: StoryQuestionFilter<T>,
    private readonly origin: FirestoreStoryQuestions,
    private readonly dest: FirestoreStoryQuestions
  ) {
    super();
  }

  async copy(params?: CopierParams | undefined): Promise<void> {
    const questions = await this.origin.get(params);
    const raw = this.filterItems(questions);
    await dumpToCollection(this.dest, raw);
  }
}
