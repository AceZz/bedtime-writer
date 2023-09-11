import { Readable } from "node:stream";

import { CreateChatCompletionRequest, OpenAIApi } from "openai";

import { TextApiConfig, TextPrompt, TextApi } from "../../../story/";
import { logger } from "../../../logger";

/**
 * Read an OpenAI stream and yield token per token.
 *
 * Note: this generator works well with `Readable.from`.
 * Note: `responseType: "stream"` must be set in the options of the Axios
 * request (second parameter of the OpenAI API functions).
 */
async function* parseOpenAiStream(stream: Readable) {
  // Every chunk of data is a binary-encoded string (Buffer) containing one or
  // several lines (some of them are empty). Each line is prefixed with
  // `data: `. The rest of the line is either "[DONE]" or a JSON document which
  // contains the token (see OpenAI's documentation for its schema).
  for await (const chunk of stream) {
    for (const json of splitChunk(chunk)) {
      const token = extractToken(json);
      if (token !== undefined) {
        yield token;
      }
    }
  }
}

/**
 * Split a `chunk` into JSON documents.
 */
function splitChunk(chunk: string): string[] {
  return chunk
    .toString()
    .split("\n")
    .filter((line: string) => line.trim() !== "")
    .map((line: string) => line.replace(/^data: /, ""))
    .filter((line: string) => line !== "[DONE]");
}

/**
 * Return the token contained in a JSON document as string.
 */
function extractToken(raw: string): string | undefined {
  try {
    const data = JSON.parse(raw);
    return data.choices?.[0]?.delta?.content;
  } catch (SyntaxError) {
    logger.error(`OpenAiTextApi: cannot parse data: ${raw}`);
  }
  return undefined;
}

/**
 * Implementation of the `TextApi` for OpenAI models.
 */
export class OpenAiTextApi implements TextApi {
  private api: OpenAIApi;
  model: string;

  constructor(api: OpenAIApi, model: string) {
    this.api = api;
    this.model = model;
    logger.info(`using OpenAI text API with model ${this.model}`);
  }

  async getText(prompts: TextPrompt[], config: TextApiConfig): Promise<string> {
    const params = this.getModelParameters(prompts, config);
    const response = await this.api.createChatCompletion(params);

    const message = response.data.choices[0].message;
    if (message === undefined) {
      throw Error("OpenAiTextApi.getText() failed");
    }
    return message.content;
  }

  async getStream(
    prompts: TextPrompt[],
    config: TextApiConfig
  ): Promise<Readable> {
    const params = {
      ...this.getModelParameters(prompts, config),
      stream: true,
    };
    const response = await this.api.createChatCompletion(params, {
      responseType: "stream",
    });
    const stream = response.data as unknown as Readable;

    return Readable.from(parseOpenAiStream(stream));
  }

  private getModelParameters(
    prompts: TextPrompt[],
    config: TextApiConfig
  ): CreateChatCompletionRequest {
    return {
      messages: prompts.map((prompt) => this.serializePrompt(prompt)),
      ...config,
      model: this.model,
    };
  }

  private serializePrompt(prompt: TextPrompt) {
    return {
      role: prompt.role ?? "user",
      content: prompt.content,
    };
  }
}
