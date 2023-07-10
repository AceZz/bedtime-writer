import { ClassicStoryLogic } from "../../logic";
import { StoryRequest } from "../story_request";

export interface StoryRequestV1Data {
  readonly author: string;
  readonly duration: number;
  readonly style: string;
  readonly characterName: string;
  readonly place?: string;
  readonly object?: string;
  readonly characterFlaw?: string;
  readonly characterPower?: string;
  readonly characterChallenge?: string;
}

export class StoryRequestV1 implements StoryRequest {
  constructor(readonly logic: string, readonly data: StoryRequestV1Data) {}

  get author(): string {
    return this.data.author;
  }

  toClassicStoryLogic(): ClassicStoryLogic {
    return new ClassicStoryLogic(
      this.data.duration,
      this.data.style,
      this.data.characterName,
      this.data.place,
      this.data.object,
      this.data.characterFlaw,
      this.data.characterPower,
      this.data.characterChallenge
    );
  }
}
