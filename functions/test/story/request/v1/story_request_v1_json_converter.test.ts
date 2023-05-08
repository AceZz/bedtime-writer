import { expect, test } from "@jest/globals";
import { StoryRequestV1 } from "../../../../src/story/request/v1/story_request_v1";
import { StoryRequestV1JsonConverter } from "../../../../src/story/request/v1/story_request_v1_json_converter";

const PARTIAL_DATA = {
  author: "an author",
  duration: 5,
  style: "some style",
  characterName: "Someone",
};

const PARTIAL_STORY_REQUEST = new StoryRequestV1("classic", PARTIAL_DATA);

const FULL_DATA = {
  ...PARTIAL_DATA,
  place: "at some place",
  object: "some object",
  characterFlaw: "has a flaw",
  characterPower: "has a power",
  characterChallenge: "being challenged",
};

const FULL_STORY_REQUEST = new StoryRequestV1("adventure", FULL_DATA);

test.each([
  ["classic", PARTIAL_DATA, PARTIAL_STORY_REQUEST],
  ["adventure", FULL_DATA, FULL_STORY_REQUEST],
])("fromJson", (logic, data, expected) => {
  const request = StoryRequestV1JsonConverter.convertFromJson(logic, data);
  expect(request).toStrictEqual(expected);
});

test.each([
  "author",
  "style",
  "characterName",
  "place",
  "object",
  "characterFlaw",
  "characterPower",
  "characterChallenge",
])("fromJson with bad strings", (key) => {
  const request = () =>
    StoryRequestV1JsonConverter.convertFromJson("classic", {
      ...PARTIAL_DATA,
      [key]: "x".repeat(51),
    });

  const error = new Error(`${key} must NOT have more than 50 characters`);
  expect(request).toThrow(error);
});

test("fromJson with duration too low", () => {
  const request = () =>
    StoryRequestV1JsonConverter.convertFromJson("classic", {
      ...PARTIAL_DATA,
      duration: -5,
    });

  const error = new Error("duration must be > 0");
  expect(request).toThrow(error);
});

test("fromJson with duration too big", () => {
  const request = () =>
    StoryRequestV1JsonConverter.convertFromJson("classic", {
      ...PARTIAL_DATA,
      duration: 11,
    });

  const error = new Error("duration must be <= 10");
  expect(request).toThrow(error);
});

test.each([
  [PARTIAL_DATA, PARTIAL_STORY_REQUEST],
  [FULL_DATA, FULL_STORY_REQUEST],
])("toJson", (expected, request) => {
  const data = new StoryRequestV1JsonConverter().toJson(request);
  expect(data).toStrictEqual(expected);
});
