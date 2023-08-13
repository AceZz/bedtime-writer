import { expect, test } from "@jest/globals";
import { FakeTextApi } from "../../../../src/story";

test("getTokens", () => {
  const api = new FakeTextApi(2, 10, 500, 100);
  const tokens = Array.from(api.getTokens());

  expect(tokens.join("").trim()).toBe(
    "Aenean et nisl finibus, lacinia ex in, vestibulum nulla. Nunc \n\nDonec eu tellus efficitur risus vehicula sagittis. In in commodo"
  );
});

test("getText", async () => {
  const api = new FakeTextApi(10, 150, 500, 100);
  const text = await api.getText();
  const tokens = Array.from(api.getTokens());

  expect(text.trim()).toBe(tokens.join("").trim());
});

test("getStream", async () => {
  const api = new FakeTextApi(10, 150, 500, 100);
  const stream = await api.getStream();
  const expectedTokens = Array.from(api.getTokens());

  const tokens: string[] = [];
  for await (const token of stream) {
    tokens.push(token);
  }

  expect(tokens.join("").trim()).toStrictEqual(expectedTokens.join("").trim());
});
