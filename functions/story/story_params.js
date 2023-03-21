export function getStoryTitle(storyParams) {
  if (storyParams.character?.name === undefined) return "Tonight's story";
  return `The story of ${storyParams.character.name}`;
}

export function getPrompt(storyParams) {
  return (
    getIntroPrompt(storyParams.style) +
    getCharacterPrompt(storyParams.character) +
    getPlacePrompt(storyParams.place) +
    getObjectPrompt(storyParams.object) +
    getMoralPrompt(storyParams.moral) +
    getNumWordsPrompt(storyParams.numWords)
  );
}

function getIntroPrompt(style) {
  return `Write a fairy tale${getStylePrompt(style)}`;
}

function getStylePrompt(style) {
  return style === undefined ? "." : ` in the style of ${style}.`;
}

function getCharacterPrompt(character) {
  return character === undefined
    ? ""
    : getCharacterIntroPrompt(character.name) +
        getCharacterFlawPrompt(character.flaw) +
        getCharacterPowerPrompt(character.power) +
        getCharacterChallengePrompt(character.challenge);
}

function getCharacterIntroPrompt(name) {
  if (name !== undefined) return ` The protagonist is ${name}.`;
  return " The story has a protagonist.";
}

function getCharacterFlawPrompt(flaw) {
  return flaw === undefined ? "" : ` It ${flaw}.`;
}

function getCharacterPowerPrompt(power) {
  return power === undefined ? "" : ` It ${power}.`;
}

function getCharacterChallengePrompt(challenge) {
  return challenge === undefined ? "" : ` It is challenged with ${challenge}.`;
}

function getPlacePrompt(place) {
  return place === undefined ? "" : ` The story happens ${place}.`;
}

function getObjectPrompt(object) {
  return object === undefined
    ? ""
    : ` The protagonist finds ${object} in the journey.`;
}

function getMoralPrompt(moral) {
  return moral === undefined ? "" : ` The moral is ${moral}.`;
}

function getNumWordsPrompt(numWords) {
  return numWords === undefined
    ? ""
    : ` The length is about ${numWords} words.`;
}

export function getImagePromptPrompt(storyParams) {
  return (
    "Generate now a very simple and concise prompt for dalle" +
    ` to illustrate ${storyParams.character.name} of the story and its environment.` +
    ` When mentioning ${storyParams.character.name}, provide a short but accurate appearance description.` +
    ` ${storyParams.character.name} should be either beautiful or cute.` +
    " You must mention a fairytale digital painting style."
  );
}
