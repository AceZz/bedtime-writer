import assert from "node:assert";
import test from "node:test";

import {
  getStoryTitle,
  getImagePrompt,
  getPrompt,
} from "../../story/story_params.js";

const partialCharacter = {
  name: "Someone",
  type: "type",
  flaw: "has a flaw",
};

const partialParams = {
  character: partialCharacter,
  place: "at some place",
};

const fullCharacter = {
  name: "Someone",
  type: "type",
  flaw: "has a flaw",
  power: "has a power",
  challenge: "being challenged",
};

const fullParams = {
  style: "some style",
  character: fullCharacter,
  place: "at some place",
  object: "some object",
  moral: "some moral",
  numWords: 300,
};

test("getStoryTitle", async (t) => {
  await t.test("basic title", () => {
    assert.strictEqual(getStoryTitle({}), "Tonight's story");
  });

  await t.test("full title", () => {
    assert.strictEqual(getStoryTitle(fullParams), "The story of Someone");
  });
});

test("getImagePrompt", async (t) => {
  await t.test("no params", () => {
    assert.strictEqual(
      getImagePrompt({}),
      "Dreamy and whimsical beautiful illustration."
    );
  });

  await t.test("full params", () => {
    assert.strictEqual(
      getImagePrompt(fullParams),
      "Dreamy and whimsical beautiful illustration of a type. It takes place at some place."
    );
  });
});

test("getPrompt", async (t) => {
  await t.test("basic params", () => {
    assert.strictEqual(
      getPrompt(partialParams),
      "Write a fairy tale. " +
        "The protagonist is Someone. " +
        "It has a flaw. " +
        "The story happens at some place."
    );
  });

  await t.test("full params", () => {
    assert.strictEqual(
      getPrompt(fullParams),
      "Write a fairy tale in the style of some style. " +
        "The protagonist is Someone. " +
        "It has a flaw. " +
        "It has a power. " +
        "It is challenged with being challenged. " +
        "The story happens at some place. " +
        "The protagonist finds some object in the journey. " +
        "The moral is some moral. " +
        "The length is about 300 words."
    );
  });
});
