import { expect, test, jest } from "@jest/globals";
import { YAMLFormReader } from "../../../src/story/reader/yaml_form_reader";
import { Form } from "../../../src/story/form";

test("parse form with date", async () => {
  const reader = new YAMLFormReader("test/story/data/form.yaml");

  const result = await reader.read();
  const expected = new Form(
    new Map([
      ["character", ["blaze", "frosty", "sparkles"]],
      ["flaw", ["failure", "lazy", "noAdvice"]],
    ]),
    new Date("2023-05-11T00:13:32Z")
  );

  expect(result).toStrictEqual(expected);
});

test("parse form without date", async () => {
  jest.useFakeTimers({ now: new Date("2023-05-11T00:13:32Z") });

  const reader = new YAMLFormReader("test/story/data/form_no_start.yaml");

  const result = await reader.read();
  const expected = new Form(
    new Map([
      ["character", ["blaze", "frosty", "sparkles"]],
      ["flaw", ["failure", "lazy", "noAdvice"]],
    ]),
    new Date("2023-05-11T00:13:32Z")
  );

  expect(result).toStrictEqual(expected);

  jest.useRealTimers();
});
