import { Character, StoryParams } from "../story_params";

export function getStoryTitle(storyParams: StoryParams) {
  if (storyParams.character?.name === undefined) return "Tonight's story";
  return `The story of ${storyParams.character.name}`;
}

export function getPrompt(storyParams: StoryParams): string {
  return (
    getIntroPrompt(storyParams.style) +
    getCharacterPrompt(storyParams.character) +
    getPlacePrompt(storyParams.place) +
    getObjectPrompt(storyParams.object) +
    getNumWordsPrompt(storyParams.numWords)
  );
}

function getIntroPrompt(style?: string): string {
  return `Write a fairy tale${getStylePrompt(style)}`;
}

function getStylePrompt(style?: string): string {
  return style === undefined ? "." : ` in the style of ${style}.`;
}

function getCharacterPrompt(character?: Character): string {
  return character === undefined
    ? ""
    : getCharacterIntroPrompt(character.name) +
        getCharacterFlawPrompt(character.flaw) +
        getCharacterPowerPrompt(character.power) +
        getCharacterChallengePrompt(character.challenge);
}

function getCharacterIntroPrompt(name?: string): string {
  if (name !== undefined) return ` The protagonist is ${name}.`;
  return " The story has a protagonist.";
}

function getCharacterFlawPrompt(flaw?: string): string {
  return flaw === undefined ? "" : ` It ${flaw}.`;
}

function getCharacterPowerPrompt(power?: string): string {
  return power === undefined ? "" : ` It ${power}.`;
}

function getCharacterChallengePrompt(challenge?: string): string {
  return challenge === undefined ? "" : ` It is challenged with ${challenge}.`;
}

function getPlacePrompt(place?: string): string {
  return place === undefined ? "" : ` The story happens ${place}.`;
}

function getObjectPrompt(object?: string): string {
  return object === undefined
    ? ""
    : ` The protagonist finds ${object} in the journey.`;
}

function getNumWordsPrompt(numWords?: number): string {
  return numWords === undefined
    ? ""
    : ` The length is about ${numWords} words.`;
}

export function getImagePromptPrompt(storyParams: StoryParams): string {
  const name = storyParams.character?.name ?? "Sparkles";

  return (
    "Generate now a very simple and concise prompt for dalle" +
    ` to illustrate ${name} of the story and its environment.` +
    ` When mentioning ${name}, provide a short but accurate appearance description.` +
    ` ${name} should be either beautiful or cute.` +
    " You must mention a fairytale digital painting style."
  );
}
