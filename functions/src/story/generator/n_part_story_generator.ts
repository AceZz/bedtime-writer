import { Readable } from "node:stream";

import { StoryLogic } from "../logic";
import { StoryPart } from "../story_part";
import { ImageApi, IMAGE_SIZE_DEFAULT } from "./image_api";
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
  protected storyText = "";
  private textPrompt: string;
  private titlePrompt: string;
  private imagePromptPrompt: string;

  constructor(
    readonly logic: StoryLogic,
    readonly storyTextApi: TextApi,
    readonly textApi: TextApi,
    readonly imageApi: ImageApi
  ) {
    this.textPrompt = this.logic.prompt();
    this.imagePromptPrompt = this.logic.imagePromptPrompt();
    this.titlePrompt = this.logic.titlePrompt();
  }

  async title(): Promise<string> {
    if (this.storyText === "") {
      throw new Error(
        "NPartStoryGenerator: cannot generate a title as no story text was found."
      );
    }

    const title = this.textApi.getText(
      [
        new SystemTextPrompt("Act as a professional storyteller."),
        new UserTextPrompt(this.textPrompt),
        new AssistantTextPrompt(this.storyText),
        new UserTextPrompt(this.titlePrompt),
      ],
      {
        max_tokens: 100,
        temperature: 0.4,
        frequency_penalty: 0,
        presence_penalty: 0,
      }
    );
    logger.debug("NPartStoryGenerator: title generated");

    return title;
  }

  async *storyParts(): AsyncGenerator<StoryPart> {
    const textStream = await this.initStoryTextStream();

    // Generate parts from stream
    let i = 0;
    const storyParts: StoryPart[] = [];
    for await (const part of splitIntoParts(textStream)) {
      this.addStoryText(part);
      logger.debug(`NPartStoryGenerator: part ${i} generated`);
      const storyPart = new StoryPart(
        part,
        this.textPrompt,
        undefined,
        undefined,
        undefined
      );
      storyParts.push(storyPart);
      i++;
    }

    // Generate image from full storyText
    const [imagePrompt, image] = await this.getImagePromptThenImage(
      this.storyText
    );
    const imagePart = new StoryPart(
      storyParts[0].text,
      storyParts[0].textPrompt,
      image,
      imagePrompt,
      this.imagePromptPrompt
    );
    storyParts[0] = imagePart;

    // Yield parts
    for (const storyPart of storyParts) yield storyPart;
  }

  private async initStoryTextStream(): Promise<Readable> {
    return await this.storyTextApi.getStream(
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

  public async getImagePromptThenImage(
    storyText: string
  ): Promise<[string, Buffer]> {
    const imagePrompt = await this.getImagePrompt(storyText);
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
      size: IMAGE_SIZE_DEFAULT,
    });
  }

  private addStoryText(part: string) {
    this.storyText += "\n" + part;
  }
}
