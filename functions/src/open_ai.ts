/**
 * Generic logic to use OpenAI APIs.
 */

import { Configuration, OpenAIApi } from "openai";
import { logger } from "./logger";

export function getOpenAiApi(key?: string): OpenAIApi {
  if (key === undefined) {
    throw TypeError("getOpenAiApi: no key provided");
  }

  const k = `${key.slice(0, 3)}...${key.slice(-4)}`;
  logger.info(`using OpenAI API with key ${k}`);

  return new OpenAIApi(
    new Configuration({
      apiKey: key,
    })
  );
}
