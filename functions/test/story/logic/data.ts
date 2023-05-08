import { ClassicStoryLogic } from "../../../src/story/logic/classic_story_logic";

export const PARTIAL_CLASSIC_STORY_LOGIC = new ClassicStoryLogic(
  3,
  "some style",
  "Someone",
  "at some place",
  undefined,
  "has a flaw",
  undefined,
  undefined
);

export const FULL_CLASSIC_STORY_LOGIC = new ClassicStoryLogic(
  3,
  "some style",
  "Someone",
  "at some place",
  "some object",
  "has a flaw",
  "has a power",
  "being challenged"
);
