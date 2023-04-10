import { expect, test } from "@jest/globals";

import { FakeTextApi, FAKE_TOKENS } from "../../../src/api/text/fake_text_api";

test("getText", async () => {
  const api = new FakeTextApi();
  const text = await api.getText();

  expect(text).toBe(FAKE_TOKENS.join(""));
});

test("getStream", async () => {
  const api = new FakeTextApi();
  const stream = await api.getStream();

  const tokens: string[] = [];
  stream.on("data", (chunk) => {
    tokens.push(chunk);
  });

  await new Promise<void>((resolve) => {
    stream.on("end", () => {
      resolve();
    });
  });

  expect(tokens).toStrictEqual(FAKE_TOKENS);
});
