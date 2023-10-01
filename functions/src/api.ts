import { FakeImageApi, FakeTextApi } from "./fake";
import { logger } from "./logger";
import { OpenAiImageApi, OpenAiTextApi, getOpenAiApi } from "./open_ai";
import { ImageApi, TextApi } from "./story";

type textApiModel = "gpt-3.5-turbo" | "gpt-4";

export function getTextApi(model: textApiModel): TextApi {
  if (process.env.TEXT_API?.toLowerCase() === "fake") {
    logger.info("using FakeTextApi");
    return new FakeTextApi();
  }

  logger.info("using OpenAiTextApi");
  return new OpenAiTextApi(getOpenAiApi(process.env.OPENAI_API_KEY), model);
}

export function getImageApi(): ImageApi {
  if (process.env.IMAGE_API?.toLowerCase() === "fake") {
    logger.info("using FakeImageApi");
    return new FakeImageApi();
  }

  logger.info("using OpenAiImageApi");
  return new OpenAiImageApi(getOpenAiApi(process.env.OPENAI_API_KEY));
}
