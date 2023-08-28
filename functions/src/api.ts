import { FakeImageApi } from "./fake";
import { logger } from "./logger";
import { OpenAiImageApi, getOpenAiApi } from "./open_ai";
import { FakeTextApi, ImageApi, OpenAiTextApi, TextApi } from "./story";

export function getTextApi(): TextApi {
  if (process.env.TEXT_API?.toLowerCase() === "fake") {
    logger.info("using FakeTextApi");
    return new FakeTextApi();
  }

  logger.info("using OpenAiTextApi");
  return new OpenAiTextApi(
    getOpenAiApi(process.env.OPENAI_API_KEY),
    "gpt-3.5-turbo"
  );
}

export function getImageApi(): ImageApi {
  if (process.env.IMAGE_API?.toLowerCase() === "fake") {
    logger.info("using FakeImageApi");
    return new FakeImageApi();
  }

  logger.info("using OpenAiImageApi");
  return new OpenAiImageApi(getOpenAiApi(process.env.OPENAI_API_KEY));
}
