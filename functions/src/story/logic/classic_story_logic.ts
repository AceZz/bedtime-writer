import { StoryLogic } from "./story_logic";

export const MAX_DURATION = 10;
export const MAX_STRING_LENGTH = 50;

/**
 * A story logic with prompts adapted to a classic story (no interactivity).
 */
export class ClassicStoryLogic implements StoryLogic {
  constructor(
    private readonly duration: number,
    private readonly style: string,
    private readonly characterName: string,
    private readonly place?: string,
    private readonly object?: string,
    private readonly characterFlaw?: string,
    private readonly characterPower?: string,
    private readonly characterChallenge?: string
  ) {}

  /**
   * Return a copy of the current object with a selection of updated parameters.
   *
   * Note: this method cannot set a property to undefined.
   */
  copyWith(params: {
    duration?: number;
    style?: string;
    characterName?: string;
    place?: string;
    object?: string;
    characterFlaw?: string;
    characterPower?: string;
    characterChallenge?: string;
  }): ClassicStoryLogic {
    return new ClassicStoryLogic(
      params.duration ?? this.duration,
      params.style ?? this.style,
      params.characterName ?? this.characterName,
      params.place ?? this.place,
      params.object ?? this.object,
      params.characterFlaw ?? this.characterFlaw,
      params.characterPower ?? this.characterPower,
      params.characterChallenge ?? this.characterChallenge
    );
  }

  isValid(): boolean {
    return this.durationIsValid() && this.stringsAreValid();
  }

  private durationIsValid(): boolean {
    return this.duration > 0 && this.duration <= MAX_DURATION;
  }

  private stringsAreValid(): boolean {
    return (
      Math.max(
        this.style.length,
        this.characterName.length,
        this.place?.length ?? 0,
        this.object?.length ?? 0,
        this.characterFlaw?.length ?? 0,
        this.characterPower?.length ?? 0,
        this.characterChallenge?.length ?? 0
      ) < MAX_STRING_LENGTH
    );
  }

  title(): string {
    return `The story of ${this.characterName}`;
  }

  prompt(): string {
    return (
      this.getIntroPrompt() +
      this.getCharacterPrompt() +
      this.getPlacePrompt() +
      this.getObjectPrompt() +
      this.getNumWordsPrompt()
    );
  }

  private getIntroPrompt(): string {
    return `Write a fairy tale in the style of ${this.style}.`;
  }

  private getCharacterPrompt(): string {
    return (
      this.getCharacterIntroPrompt() +
      this.getCharacterFlawPrompt() +
      this.getCharacterPowerPrompt() +
      this.getCharacterChallengePrompt()
    );
  }

  private getCharacterIntroPrompt(): string {
    return ` The protagonist is ${this.characterName}.`;
  }

  private getCharacterFlawPrompt(): string {
    const flaw = this.characterFlaw;
    return flaw === undefined ? "" : ` It ${flaw}.`;
  }

  private getCharacterPowerPrompt(): string {
    const power = this.characterPower;
    return power === undefined ? "" : ` It ${power}.`;
  }

  private getCharacterChallengePrompt(): string {
    const challenge = this.characterChallenge;
    return challenge === undefined
      ? ""
      : ` It is challenged with ${challenge}.`;
  }

  private getPlacePrompt(): string {
    const place = this.place;
    return place === undefined ? "" : ` The story happens ${place}.`;
  }

  private getObjectPrompt(): string {
    const object = this.object;
    return object === undefined
      ? ""
      : ` The protagonist finds ${object} in the journey.`;
  }

  private getNumWordsPrompt(): string {
    // One minute is about 100 words.
    return ` The length is about ${100 * this.duration} words.`;
  }

  imagePromptPrompt(): string {
    const name = this.characterName;

    return (
      "Generate now a very simple and concise prompt for dalle" +
      ` to illustrate ${name} of the story and its environment.` +
      ` When mentioning ${name}, provide a short but accurate appearance description.` +
      ` ${name} should be either beautiful or cute.` +
      " You must mention a fairytale digital painting style."
    );
  }

  toJson(): { [key: string]: string | number | undefined } {
    return {
      duration: this.duration,
      style: this.style,
      characterName: this.characterName,
      place: this.place,
      object: this.object,
      characterFlaw: this.characterFlaw,
      characterPower: this.characterPower,
      characterChallenge: this.characterChallenge,
    };
  }
}
