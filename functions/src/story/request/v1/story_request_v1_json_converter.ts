import Ajv, { ErrorObject, JSONSchemaType } from "ajv";
import { StoryRequestV1, StoryRequestV1Data } from "./story_request_v1";
import { StoryRequestJsonConverter } from "../story_request_json_converter";
import {
  MAX_DURATION,
  MAX_STRING_LENGTH,
} from "../../logic/classic_story_logic";

const AJV = new Ajv();

const SCHEMA: JSONSchemaType<StoryRequestV1Data> = {
  type: "object",
  properties: {
    author: { type: "string", maxLength: 50 },
    duration: { type: "integer", exclusiveMinimum: 0, maximum: MAX_DURATION },
    style: { type: "string", maxLength: MAX_STRING_LENGTH },
    characterName: { type: "string", maxLength: MAX_STRING_LENGTH },
    place: { type: "string", nullable: true, maxLength: MAX_STRING_LENGTH },
    object: { type: "string", nullable: true, maxLength: MAX_STRING_LENGTH },
    characterFlaw: {
      type: "string",
      nullable: true,
      maxLength: MAX_STRING_LENGTH,
    },
    characterPower: {
      type: "string",
      nullable: true,
      maxLength: MAX_STRING_LENGTH,
    },
    characterChallenge: {
      type: "string",
      nullable: true,
      maxLength: MAX_STRING_LENGTH,
    },
  },
  required: ["author", "duration", "style", "characterName"],
  additionalProperties: false,
};

const validate = AJV.compile(SCHEMA);

export class StoryRequestV1JsonConverter
  implements StoryRequestJsonConverter<StoryRequestV1>
{
  /**
   * Convert a JSON object into the corresponding StoryRequest.
   */
  static convertFromJson(logic: string, raw: object): StoryRequestV1 {
    return new StoryRequestV1JsonConverter().fromJson(logic, raw);
  }

  fromJson(logic: string, raw: object): StoryRequestV1 {
    if (validate(raw)) {
      return new StoryRequestV1(logic, raw);
    }

    const message = this.formatErrorMessage(validate.errors ?? []);
    throw new Error(message);
  }

  private formatErrorMessage(errors: ErrorObject[]): string {
    // Remove the `/` at the beginning of error.instancePath.
    return errors
      .map((error) => `${error.instancePath.slice(1)} ${error.message ?? ""}`)
      .join(", ");
  }

  toJson(request: StoryRequestV1): object {
    return request.data;
  }
}
