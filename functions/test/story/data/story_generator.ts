import { NPartStoryGenerator } from "../../../src/story";
import { FAKE_IMAGE_API, FAKE_TEXT_API } from "./fake";
import { CLASSIC_LOGIC_0 } from "./story_logic";

/**
 * A dummy generator.
 */
export const GENERATOR_0 = new NPartStoryGenerator(
  CLASSIC_LOGIC_0,
  FAKE_TEXT_API,
  FAKE_IMAGE_API
);
