/**
 * Received from the API consumer.
 */
export interface StoryParams {
  character?: Character;
  style?: string;
  place?: string;
  object?: string;
  moral?: string;
  numWords?: number;
}

export interface Character {
  name?: string;
  flaw?: string;
  power?: string;
  challenge?: string;
}
