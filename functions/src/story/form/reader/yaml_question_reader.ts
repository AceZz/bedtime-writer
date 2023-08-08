import { readFile } from "fs/promises";

import { parse } from "yaml";

import { StoryQuestion } from "../story_question";
import { Reader } from "./reader";
import { StoryChoice } from "../story_choice";

/**
 * This class reads a YAML file.
 *
 * The YAML file should have this structure:
 *
 * ```yaml
 * question1:
 *   text: "What is love?"
 *   choices:
 *     choice1:
 *       text: "Baby don't hurt me"
 *       imagePath: "someImage.png"
 *     choice2:
 *       text: "No more"
 *       imagePath: "anotherImage.png"
 * question2:
 *   ...
 * ```
 */
export class YAMLQuestionReader implements Reader<StoryQuestion[]> {
  constructor(readonly path: string) {}

  async read(): Promise<StoryQuestion[]> {
    const file = await readFile(this.path, "utf8");
    const data = parse(file);

    const parsed: StoryQuestion[] = [];
    for (const questionKey in data) {
      parsed.push(await this.parseQuestion(questionKey, data[questionKey]));
    }

    return parsed;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async parseQuestion(key: string, data: any): Promise<StoryQuestion> {
    const choices: StoryChoice[] = [];
    for (const choiceKey in data.choices) {
      choices.push(await this.parseChoice(choiceKey, data.choices[choiceKey]));
    }

    return new StoryQuestion(key, data.text, choices);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async parseChoice(key: string, data: any): Promise<StoryChoice> {
    return await StoryChoice.fromImagePath(key, data.text, data.imagePath);
  }
}