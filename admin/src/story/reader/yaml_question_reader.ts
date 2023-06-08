import { readFile } from "fs/promises";

import { parse } from "yaml";

import { Question } from "../question";
import { Reader } from "./reader";
import { Choice } from "../choice";

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
export class YAMLQuestionReader implements Reader<Question[]> {
  constructor(readonly path: string) {}

  async read(): Promise<Question[]> {
    const file = await readFile(this.path, "utf8");
    const data = parse(file);

    const parsed: Question[] = [];
    for (const questionKey in data) {
      parsed.push(this.parseQuestion(questionKey, data[questionKey]));
    }

    return parsed;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private parseQuestion(key: string, data: any): Question {
    const choices: Choice[] = [];
    for (const choiceKey in data.choices) {
      choices.push(this.parseChoice(choiceKey, data.choices[choiceKey]));
    }

    return new Question(key, data.text, choices);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private parseChoice(key: string, data: any): Choice {
    return new Choice(key, data.text, data.imagePath);
  }
}
