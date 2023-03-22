import assert from "node:assert";
import test from "node:test";

import {
  fakeOpenAi,
  FAKE_IMAGE_URL,
  FAKE_TOKENS,
} from "../../story/fake_open_ai.js";

test("fakeOpenAi", async (t) => {
  await t.test("createChatCompletion", async () => {
    const request = await fakeOpenAi.createChatCompletion();

    assert.equal(request.data.choices[0].message.content, FAKE_TOKENS.join(""));
  });

  await t.test("createChatCompletion with stream", async () => {
    const request = await fakeOpenAi.createChatCompletion(
      {},
      { responseType: "stream" }
    );
    const stream = request.data;

    const tokens = [];
    stream.on("data", (chunk) => {
      for (const line of chunk.toString().split("\n")) {
        tokens.push(JSON.parse(line).choices[0].delta.content);
      }
    });
    await new Promise((resolve) => {
      stream.on("end", () => {
        resolve();
      });
    });

    assert.equal(tokens.join(""), FAKE_TOKENS.join(""));
  });

  await t.test("createImage", async () => {
    const request = await fakeOpenAi.createImage();

    assert.equal(request.data.data[0].url, FAKE_IMAGE_URL);
  });
});
