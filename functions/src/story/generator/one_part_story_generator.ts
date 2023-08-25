import { Stream } from "node:stream";

import {
  AssistantTextPrompt,
  SystemTextPrompt,
  TextApi,
  UserTextPrompt,
} from "./text_api";
import { logger } from "../../logger";
import { StoryLogic } from "../logic/";
import { StoryPart } from "../story_part";
import { ImageApi, IMAGE_SIZE_DEFAULT } from "./image_api";
import { StoryGenerator } from "./story_generator";

const NUM_TOKENS_SUMMARY = 100;

export class OnePartStoryGenerator implements StoryGenerator {
  constructor(
    readonly logic: StoryLogic,
    readonly textApi: TextApi,
    readonly imageApi: ImageApi
  ) {}

  title(): string {
    return this.logic.title();
  }

  async *storyParts(): AsyncGenerator<StoryPart> {
    const textPrompt = this.logic.prompt();
    const imagePromptPrompt = this.logic.imagePromptPrompt();

    const stream = await this.getTextStream(textPrompt);
    logger.debug("OnePartStoryGenerator: story stream created");

    const [{ imagePrompt, image }, text] = await Promise.all([
      this.getImagePromptThenImage(textPrompt, stream, imagePromptPrompt),
      this.getStory(stream),
    ]);

    yield new StoryPart(
      text,
      textPrompt,
      image,
      imagePrompt,
      imagePromptPrompt
    );
  }

  private async getTextStream(textPrompt: string): Promise<Stream> {
    return this.textApi.getStream(
      [
        new SystemTextPrompt("Act as a professional writer for children."),
        new UserTextPrompt(textPrompt),
      ],
      {
        max_tokens: 1200,
        temperature: 1.0,
        frequency_penalty: 0.7,
        presence_penalty: 0.2,
      }
    );
  }

  private async getImagePromptThenImage(
    textPrompt: string,
    stream: Stream,
    imagePromptPrompt: string
  ) {
    logger.debug("OnePartStoryGenerator: summary generation started");
    const summary = await this.getSummary(stream);
    logger.debug("OnePartStoryGenerator: summary generated");

    logger.debug("OnePartStoryGenerator: image prompt generation started");
    const imagePrompt = await this.getImagePrompt(
      textPrompt,
      summary,
      imagePromptPrompt
    );
    logger.debug("OnePartStoryGenerator: image prompt generated");

    logger.debug("OnePartStoryGenerator: image generation started");
    const image = await this.getImage(imagePrompt);
    logger.debug("OnePartStoryGenerator: image generated");

    return { imagePrompt, image };
  }

  private async getSummary(stream: Stream): Promise<string> {
    // Note: only the first resolve is used in a Promise
    return new Promise((resolve) => {
      const tokens: string[] = [];

      stream.on("data", (token) => {
        tokens.push(token);

        if (tokens.length === NUM_TOKENS_SUMMARY) {
          resolve(tokens.join(""));
        }
      });

      stream.on("end", () => {
        resolve(tokens.join(""));
      });
    });
  }

  private async getImagePrompt(
    textPrompt: string,
    summary: string,
    imagePromptPrompt: string
  ): Promise<string> {
    return this.textApi.getText(
      [
        new SystemTextPrompt("Act as a professional illustrator for children."),
        new UserTextPrompt(textPrompt),
        new AssistantTextPrompt(summary),
        new UserTextPrompt(imagePromptPrompt),
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

  private async getStory(stream: Stream): Promise<string> {
    const tokens: string[] = [];

    stream.on("data", async (token) => {
      tokens.push(token);
    });

    const storyIsComplete = new Promise<void>((resolve) => {
      stream.on("end", () => {
        resolve();
      });
    });
    await storyIsComplete;
    logger.debug("OnePartStoryGenerator: story generated");

    return tokens.join("");
  }
}
