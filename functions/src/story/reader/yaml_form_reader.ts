import { readFile } from "fs/promises";

import { parse } from "yaml";

import { StoryForm } from "../story_form";
import { Reader } from "./reader";

/**
 * This class parses a YAML file.
 *
 * The YAML file should have this structure:
 *
 * ```yaml
 * start: (optional) 2023-06-11T00:13:32
 * questions:
 *   <question1>: [<choice1>, <choice2>]
 *   <question2>: ...
 * ```
 */
export class YAMLFormReader implements Reader<StoryForm> {
  constructor(readonly path: string) {}

  async read(): Promise<StoryForm> {
    const file = await readFile(this.path, "utf8");
    const data = parse(file);

    const start = data.start === undefined ? new Date() : new Date(data.start);

    const questionData = data.questions ?? {};
    const questions = new Map();
    for (const questionId in questionData) {
      questions.set(questionId, questionData[questionId]);
    }

    return new StoryForm(questions, start);
  }
}
