import { sampleCartesianProduct } from "../../../utils";
import { StoryForm } from "../story_form";
import { StoryQuestion } from "../story_question";
import { shuffleQuestionsCombinations } from "./questions_combinations";
import { iterQuestionsVariations } from "./questions_variations";

/**
 * Generate `StoryForm`s from questions and parameters.
 */
export class StoryFormManager {
  constructor(
    readonly allQuestions: StoryQuestion[],
    readonly numQuestionsPerForm: number,
    readonly numChoicesPerQuestion: number
  ) {}

  *generateForms(numForms: number): Generator<StoryForm> {
    // Ideas for improvements:
    //   * If numForms < (numQuestionsPerForm among this.allQuestions.length),
    //     no need to store the generators, since each question list will be
    //     used at most once.

    // Cache the question variations.
    const allVariations = getAllVariations(
      this.allQuestions,
      this.numChoicesPerQuestion
    );

    // Create and store all `iterForms` generators, but do not use them now.
    const generators: Generator<StoryForm>[] = [];
    for (const questions of shuffleQuestionsCombinations(
      this.allQuestions,
      this.numQuestionsPerForm
    )) {
      generators.push(iterForms(allVariations, questions));
    }

    let numFormsGenerated = 0;
    let numDoneGenerators = 0;

    while (numFormsGenerated < numForms) {
      if (numDoneGenerators >= generators.length) {
        throw Error(
          `Can only generate ${numFormsGenerated} out of the ${numForms} ` +
            "requested."
        );
      }
      numDoneGenerators = 0;

      for (const generator of generators) {
        const value = generator.next().value;

        if (value !== undefined) {
          yield value;
          if (++numFormsGenerated === numForms) return;
        } else {
          numDoneGenerators++;
        }
      }
    }
  }
}

export function getAllVariations(
  baseQuestions: StoryQuestion[],
  numChoices: number
): Map<string, StoryQuestion[]> {
  const map = new Map<string, StoryQuestion[]>();
  for (const baseQuestion of baseQuestions) {
    map.set(
      baseQuestion.id,
      Array.from(iterQuestionsVariations(baseQuestion, numChoices))
    );
  }
  return map;
}

/**
 * Generate all the `StoryForm`s obtained from `baseQuestions`.
 *
 * We assume that every question in `baseQuestions` is supposed to be used in
 * the form. No duplicate / priority / etc. check is made by this function.
 */
export function* iterForms(
  allVariations: Map<string, StoryQuestion[]>,
  baseQuestions: StoryQuestion[]
): Generator<StoryForm> {
  // `variations[i][j]` is `questions[i]` with a specific set of `numChoices`
  // choices.
  const variations: StoryQuestion[][] = [];

  for (const baseQuestion of baseQuestions) {
    const variation = allVariations.get(baseQuestion.id);
    if (variation === undefined) throw Error;
    variations.push(variation);
  }

  // Use the cartesian products of these variations to generate a `StoryForm`.
  for (const formQuestions of sampleCartesianProduct(undefined, variations)) {
    yield new StoryForm(formQuestions);
  }
}
