import {
  CACHE_AUTHOR,
  CLASSIC_LOGIC,
  StoryRequestV1,
} from "../../../src/story";
import { FORM_CHARACTER_ID } from "./story_form";
import { QUESTIONS_CHARACTER } from "./story_question";

const DURATION = 1;
const STYLE = "style1";

/**
 * Works with FORM_CHARACTER.
 */
async function REQUEST_CHARACTER_0(
  author: string = CACHE_AUTHOR
): Promise<StoryRequestV1> {
  const [questionCharacterName, questionCharacterFlaw] =
    await QUESTIONS_CHARACTER();

  return new StoryRequestV1(CLASSIC_LOGIC, {
    author: author,
    formId: FORM_CHARACTER_ID,
    duration: DURATION,
    style: STYLE,
    characterName: questionCharacterName.choiceIds[0],
    characterFlaw: questionCharacterFlaw.choiceIds[0],
  });
}

/**
 * Works with FORM_CHARACTER.
 */
async function REQUEST_CHARACTER_1(
  author: string = CACHE_AUTHOR
): Promise<StoryRequestV1> {
  const [questionCharacterName, questionCharacterFlaw] =
    await QUESTIONS_CHARACTER();

  return new StoryRequestV1(CLASSIC_LOGIC, {
    author: author,
    formId: FORM_CHARACTER_ID,
    duration: DURATION,
    style: STYLE,
    characterName: questionCharacterName.choiceIds[1],
    characterFlaw: questionCharacterFlaw.choiceIds[0],
  });
}

/**
 * Works with FORM_CHARACTER.
 */
export async function REQUESTS_CHARACTER(
  author: string = CACHE_AUTHOR
): Promise<StoryRequestV1[]> {
  return [await REQUEST_CHARACTER_0(author), await REQUEST_CHARACTER_1(author)];
}
