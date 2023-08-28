import { FakeImageApi, FakeTextApi } from "../../../src/fake";
import { NPartStoryGenerator } from "../../../src/story";
import { CLASSIC_LOGIC_0 } from "./story_logic";

/**
 * A dummy generator.
 */
const TEXT_API = new FakeTextApi();
const IMAGE_API = new FakeImageApi();
export const GENERATOR_0 = new NPartStoryGenerator(
  CLASSIC_LOGIC_0,
  TEXT_API,
  IMAGE_API
);
