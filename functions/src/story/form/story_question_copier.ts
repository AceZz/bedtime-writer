import { Copier } from "../copier";
import { StoryQuestion } from "./story_question";

export type StoryQuestionFilter<T> = (question: StoryQuestion) => T;

export abstract class StoryQuestionCopier<
  T extends { [key: string]: any }
> extends Copier<StoryQuestion, T> {}
