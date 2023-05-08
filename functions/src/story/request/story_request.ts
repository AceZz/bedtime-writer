import { ClassicStoryLogic } from "../logic";

/**
 * A (possibly invalid) story request.
 *
 * This class is a layer between raw data formats (JSON, Firestore, etc.),
 * which conversion is handled by *Converter classes, and a StoryLogic.
 */
export interface StoryRequest {
  get logic(): string;

  get author(): string;

  toClassicStoryLogic(): ClassicStoryLogic;
}
