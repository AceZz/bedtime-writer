export function getStoryTitle(storyParams) {
  if (storyParams.character?.name === undefined) return "Tonight's story";
  return `The story of ${storyParams.character.name}`;
}

export function getImagePrompt(storyParams) {
  return (
    getIntroImagePrompt() +
    getCharacterImagePrompt(storyParams.character) +
    getPlaceImagePrompt(storyParams.place)
  );
}

function getIntroImagePrompt() {
  return "Dreamy and whimsical beautiful illustration";
}

function getCharacterImagePrompt(character) {
  return character?.type !== undefined ? ` of a ${character.type}.` : ".";
}

function getPlaceImagePrompt(place) {
  return place === undefined ? "" : ` It takes place ${place}.`;
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
