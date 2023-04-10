import { Stream } from "node:stream";

/**
 * Generic interface to generate text.
 */
export interface TextApi {
  /**
   * Generate text directly.
   *
   * @param prompts The prompts of the text generation.
   * @param config Specific configuration for the text generation.
   */
  getText(prompts: TextPrompt[], config: TextApiConfig): Promise<string>;

  /**
   * Generate text directly through a stream.
   *
   * @param prompts The prompts of the text generation.
   * @param config Specific configuration for the text generation.
   */
  getStream(prompts: TextPrompt[], config: TextApiConfig): Promise<Stream>;
}

type TextPromptRole = "system" | "user" | "assistant";

/**
 * A prompt sent to the text API.
 */
export class TextPrompt {
  content: string;
  role?: TextPromptRole;

  constructor(content: string, role?: TextPromptRole) {
    this.content = content;
    this.role = role;
  }
}

export class SystemTextPrompt extends TextPrompt {
  constructor(content: string) {
    super(content, "system");
  }
}

export class UserTextPrompt extends TextPrompt {
  constructor(content: string) {
    super(content, "user");
  }
}

export class AssistantTextPrompt extends TextPrompt {
  constructor(content: string) {
    super(content, "assistant");
  }
}

export interface TextApiConfig {
  temperature?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  max_tokens?: number;
}
