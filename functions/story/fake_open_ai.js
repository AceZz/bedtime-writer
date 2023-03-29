/**
 * This file contains a fake Open AI API that provides the same API as the
 * real one to generate text (completion) and images.
 * It is especially useful when testing code.
 */
import { Buffer } from "node:buffer";
import { readFileSync } from "node:fs";
import { PassThrough } from "node:stream";

export const fakeOpenAi = {};

export const FAKE_TOKENS = getFakeTokens(500);
export const FAKE_IMAGE_BYTES = readFileSync("test/story/fake_image_bytes.jpg");

function getFakeTokens(num) {
  return [...Array(num)].map((_, i) => `T${i} `);
}

fakeOpenAi.createChatCompletion = async (request, options = {}) => {
  if (options.responseType === "stream") {
    return {
      data: getFakeStream(FAKE_TOKENS),
    };
  }

  return {
    data: getFakeData(FAKE_TOKENS),
  };
};

fakeOpenAi.createImage = async () => {
  return {
    data: {
      data: [{ b64_json: FAKE_IMAGE_BYTES }],
    },
  };
};

function getFakeData(tokens) {
  return {
    choices: [
      {
        message: {
          content: tokens.join(""),
        },
      },
    ],
  };
}

function getFakeStream(tokens) {
  const stream = new PassThrough();

  setTimeout(() => {
    for (const chunk of getFakeStreamData(tokens)) {
      stream.emit("data", Buffer.from(JSON.stringify(chunk)));
    }
    stream.emit("end");
  }, 1000);

  return stream;
}

function getFakeStreamData(tokens) {
  return tokens.map((token, i) => ({
    id: `id-${i}`,
    choices: [
      {
        delta: {
          content: token,
        },
      },
    ],
  }));
}
