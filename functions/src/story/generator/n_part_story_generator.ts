import { Readable } from "node:stream";

import { StoryLogic } from "../logic";
import { StoryPart } from "../story_part";
import { ImageApi } from "./image_api";
import { StoryGenerator } from "./story_generator";
import {
  AssistantTextPrompt,
  SystemTextPrompt,
  TextApi,
  UserTextPrompt,
} from "./text_api";
import { logger } from "../../logger";

/**
 * Split `stream` into parts. Separator is "\n\n".
 */
async function* splitIntoParts(stream: Readable): AsyncGenerator<string> {
  let buffer: string[] = [];

  for await (const token of stream) {
    buffer.push(token);

    if (isPart(buffer)) {
      yield buffer.join("");
      buffer = [];
    }
  }

  const remaining = buffer.join("");
  if (remaining.trim() != "") {
    yield remaining;
  }
}

function isPart(tokens: string[]) {
  return tokens.slice(-2).join("").endsWith("\n\n");
}

export class NPartStoryGenerator implements StoryGenerator {
  private textPrompt: string;
  private imagePromptPrompt: string;

  constructor(
    readonly logic: StoryLogic,
    readonly textApi: TextApi,
    readonly imageApi: ImageApi
  ) {
    this.textPrompt = this.logic.prompt();
    this.imagePromptPrompt = this.logic.imagePromptPrompt();
  }

  title(): string {
    return this.logic.title();
  }

  async *storyParts(): AsyncGenerator<StoryPart> {
    const textStream = await this.initTextStream();

    let i = 0;
    for await (const part of splitIntoParts(textStream)) {
      logger.debug(`NPartStoryGenerator: part ${i} generated`);

      let imagePrompt: string | undefined = undefined;
      let image: Buffer | undefined = undefined;
      let imagePromptPrompt: string | undefined = undefined;
      if (i == 0) {
        [imagePrompt, image] = await this.getImageThenImagePrompt(part);
        imagePromptPrompt = this.imagePromptPrompt;
      }

      yield new StoryPart(
        part,
        this.textPrompt,
        image,
        imagePrompt,
        imagePromptPrompt
      );

      i++;
    }
  }

  private async initTextStream(): Promise<Readable> {
    return await this.textApi.getStream(
      [
        new SystemTextPrompt("Act as a professional writer for children."),
        new UserTextPrompt(this.textPrompt),
      ],
      {
        max_tokens: 1200,
        temperature: 1.0,
        frequency_penalty: 0.7,
        presence_penalty: 0.2,
      }
    );
  }

  private async getImageThenImagePrompt(
    firstPart: string
  ): Promise<[string, Buffer]> {
    const imagePrompt = await this.getImagePrompt(firstPart);
    logger.debug("NPartStoryGenerator: imagePrompt generated");
    const image = await this.getImage(imagePrompt);
    logger.debug("NPartStoryGenerator: image generated");
    return [imagePrompt, image];
  }

  private async getImagePrompt(firstPart: string): Promise<string> {
    return this.textApi.getText(
      [
        new SystemTextPrompt("Act as a professional illustrator for children."),
        new UserTextPrompt(this.textPrompt),
        new AssistantTextPrompt(firstPart),
        new UserTextPrompt(this.imagePromptPrompt),
      ],
      {
        max_tokens: 100,
        temperature: 0.4,
        frequency_penalty: 0,
        presence_penalty: 0,
      }
    );
  }

  private async getImage(imagePrompt: string): Promise<Buffer> {
    return this.imageApi.getImage(imagePrompt, {
      n: 1,
      size: "512x512",
    });
  }
}
