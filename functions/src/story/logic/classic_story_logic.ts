import { StoryLogic } from "./story_logic";
import { APPEARANCE } from "./prompt_data";

export const MAX_DURATION = 10;
export const MAX_STRING_LENGTH = 50;

/**
 * A story logic with prompts adapted to a classic story (no interactivity).
 */
export class ClassicStoryLogic implements StoryLogic {
  private readonly logicType = "classic";
  private readonly appearance: string;

  constructor(
    private readonly duration: number,
    private readonly style: string,
    private readonly characterName: string,
    private readonly place?: string,
    private readonly object?: string,
    private readonly characterFlaw?: string,
    private readonly characterPower?: string,
    private readonly characterChallenge?: string
  ) {
    this.appearance = APPEARANCE[this.characterName];
  }

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

  prompt(): string {
    return (
      this.getIntroPrompt() +
      this.getCharacterPrompt() +
      this.getPlacePrompt() +
      this.getObjectPrompt() +
      this.getNumWordsPrompt() +
      this.getFormatPrompt()
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
    if (this.appearance === undefined) {
      throw new Error(
        `getCharacterIntroPrompt: ${this.characterName} does not have an appearance defined.`
      );
    } else {
      return ` The protagonist is ${this.characterName}. ${this.appearance}.`;
    }
  }

  private getCharacterFlawPrompt(): string {
    const flaw = this.characterFlaw;
    return flaw === undefined ? "" : ` The protagonist ${flaw}.`;
  }

  private getCharacterPowerPrompt(): string {
    const power = this.characterPower;
    return power === undefined ? "" : ` The protagonist ${power}.`;
  }

  private getCharacterChallengePrompt(): string {
    const challenge = this.characterChallenge;
    return challenge === undefined ? "" : ` The protagonist ${challenge}.`;
  }

  private getPlacePrompt(): string {
    const place = this.place;
    return place === undefined ? "" : ` The story takes place ${place}.`;
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

  private getFormatPrompt(): string {
    return " Do not write a title, directly start writing the story.";
  }

  titlePrompt(): string {
    return (
      "Generate now an engaging and captivating title for this story." +
      " The title should be short." +
      " Write directly the title, with no punctuations or symbols."
    );
  }

  imagePromptPrompt(): string {
    const name = this.characterName;
    return (
      `Generate now a detailed prompt for dalle, to paint ${name} of the story and their environment.` +
      `When mentioning ${name}, provide an accurate appearance description.` +
      `${name} should be either beautiful or cute.` +
      "You must mention regarding style: text-free illustration, fairytale, dreamy atmosphere, whimsical, magical." +
      "You must mention one or two emotions among the following: wonder, calm, curiosity, joy, intrigue, inspiration, nostalgia, mystery, serenity." +
      "Your prompt must be 100 words or less." +
      "Your prompt must start with: Create a digital painting of ..." +
      "Directly write the prompt. Do not make paragraphs."
    );
  }

  toJson(): { [key: string]: string | number | undefined } {
    return {
      logicType: this.logicType,
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

  toString(): string {
    const parts = [];
    parts.push(`characterName: ${this.characterName}`);
    if (this.place) {
      parts.push(`place: ${this.place}`);
    }
    if (this.object) {
      parts.push(`object: ${this.object}`);
    }
    if (this.characterFlaw) {
      parts.push(`characterFlaw: ${this.characterFlaw}`);
    }
    if (this.characterPower) {
      parts.push(`characterPower: ${this.characterPower}`);
    }
    if (this.characterChallenge) {
      parts.push(`characterChallenge: ${this.characterChallenge}`);
    }
    parts.push(`logicType: ${this.logicType}`);
    parts.push(`duration: ${this.duration}`);
    parts.push(`style: ${this.style}`);

    return parts.join(" | ");
  }
}
