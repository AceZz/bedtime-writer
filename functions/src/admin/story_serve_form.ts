/**
 * Copy an approved form (and it's associated questions and cached stories) from
 * the landing area to the serving area.
 */

import { prompt } from "../utils";

import { FieldPath } from "firebase-admin/firestore";
import {
  FirebaseStoryCopier,
  FirebaseStoryReader,
  FirestoreContext,
  FirestoreStories,
  FirestoreStoryForm,
  FirestoreStoryForms,
  FirestoreStoryQuestions,
  initEnv,
  initFirebase,
} from "../firebase";
import { collectionInfo } from "./utils";
import { StoryForm, StoryQuestion } from "../story";
import _ from "lodash";

type Collections = {
  questions: FirestoreStoryQuestions;
  forms: FirestoreStoryForms;
  stories: FirestoreStories;
};

async function main() {
  // Init everything we need.
  initEnv();
  initFirebase();

  const firestore = new FirestoreContext();
  const landing: Collections = {
    questions: firestore.storyQuestions,
    forms: firestore.storyFormsLanding,
    stories: firestore.storyCacheLanding,
  };
  const serving: Collections = {
    questions: firestore.storyQuestionsServing,
    forms: firestore.storyFormsServing,
    stories: firestore.storyCacheServing,
  };

  // Retrieve data.
  const approvedForms = await getApprovedForms(landing);
  console.log(
    `${approvedForms.size} forms are cached and approved in the landing area ` +
      `(${collectionInfo(landing.forms)}).`
  );

  const servingFormIds = await getServingFormIds(serving);
  console.log(
    `${servingFormIds.size} forms are available in the serving area ` +
      `(${collectionInfo(serving.forms)}).`
  );

  // Retrieve the form to serve.
  const formId = await promptFormId(approvedForms, servingFormIds);
  const form = approvedForms.get(formId)!;

  console.log(`\nForm ${formId} will be made available PUBLICLY.`);

  // Log the questions and form copier.
  const questionIds = form.questionIds;
  console.log(
    `\t${questionIds.length} questions will be copied or replaced from ` +
      `${collectionInfo(landing.questions)} to ` +
      `${collectionInfo(serving.questions)}.`
  );
  console.log(
    `\tForm ${formId} will be copied or replaced from ` +
      `${collectionInfo(landing.forms)} to ` +
      `${collectionInfo(serving.forms)}.`
  );

  // Initialized the story copier.
  const storyReader = new FirebaseStoryReader(landing.stories);
  const storyIds = (await storyReader.readFormStories(formId)).map((x) => x.id);
  const storyCopier = getStoryCopier(landing, serving);
  console.log(
    `\t${storyIds.length} stories will be copied or replaced from ` +
      `${collectionInfo(landing.stories)} to ` +
      `${collectionInfo(serving.stories)}.`
  );

  if (await confirm()) {
    console.log("Copying the questions...");
    await landing.questions.copy(serving.questions, questionTransformer, {
      ids: questionIds,
    });
    console.log("Copying the form...");
    await landing.forms.copy(serving.forms, formTransformer, { ids: [formId] });
    console.log("Copying the stories...");
    await storyCopier.copy({ ids: storyIds });

    await check(serving, questionIds, formId, storyIds);
  } else {
    console.log("Abort.");
    process.exit(0);
  }
}

async function getApprovedForms(
  landing: Collections
): Promise<Map<string, StoryForm>> {
  return landing.forms.get({ isApproved: true, isCached: true });
}

async function getServingFormIds(serving: Collections): Promise<Set<string>> {
  const servingForms = await serving.forms
    .formsRef()
    .select(FieldPath.documentId())
    .get();
  return new Set(servingForms.docs.map((doc) => doc.id));
}

async function promptFormId(
  approvedForms: Map<string, StoryForm>,
  servingFormIds: Set<string>
) {
  const unservedFormIds = Array.from(approvedForms.keys()).filter(
    (id) => !servingFormIds.has(id)
  );

  if (unservedFormIds.length === 0) {
    console.log(
      "\nAll approved forms are already served. You may want to:\n" +
        "  * Generate new forms with `npm run story_gen_forms`.\n" +
        "  * Cache generated forms with `npm run story_gen_cache`.\n" +
        "  * Approve cached forms with `npm run admin_interface`."
    );
    process.exit(0);
  }

  while (true) {
    for (const [index, formId] of unservedFormIds.entries()) {
      const form = approvedForms.get(formId)!;
      console.log(
        `\n(${index + 1} / ${unservedFormIds.length}) ` +
          `Form ${formId} is not served:\n`
      );
      console.log(form.toString());

      const answer = (
        await prompt("\nServe this form? (y/N/q) ")
      ).toLowerCase();
      if (["y", "yes"].includes(answer)) {
        return formId;
      }
      if (["q", "quit"].includes(answer)) {
        console.log("Abort.");
        process.exit(0);
      }
    }
  }
}

/**
 * Keep the text of the question, as well as the image and the text of each
 * choice.
 */
function questionTransformer(question: StoryQuestion) {
  return {
    text: question.text,
    choices: new Map(
      Array.from(question.choices.entries()).map(([id, choice]) => [
        id,
        _.pick(choice, ["image", "text"]),
      ])
    ),
  };
}

/**
 * Keep the number of questions of the form, as well as each `question...` and
 * `question...Choices`.
 */
function formTransformer(form: FirestoreStoryForm) {
  const props = [...Array(form.numQuestions).keys()].flatMap((i) => [
    `question${i}`,
    `question${i}Choices`,
  ]);

  return _.pick(form, ["numQuestions", ...props]);
}

/**
 * Keep `request`, `title`, `partIds`, `images/` (`data` only), and `parts/`
 * (`text` and `image` only).
 */
function getStoryCopier(
  landing: Collections,
  serving: Collections
): FirebaseStoryCopier<{ [key: string]: any }> {
  return new FirebaseStoryCopier(
    (story) => {
      const storyImages = story.images as Map<string, object>;
      const images = new Map(
        Array.from(storyImages.entries()).map(([id, image]) => [
          id,
          _.pick(image, ["data"]),
        ])
      );

      const storyParts = story.parts as Map<string, object>;
      const parts = new Map(
        Array.from(storyParts.entries()).map(([id, part]) => [
          id,
          _.pick(part, ["image", "text"]),
        ])
      );

      return {
        ..._.pick(story, ["request", "status", "title", "partIds"]),
        images: images,
        parts: parts,
      };
    },
    landing.stories,
    serving.stories
  );
}

async function confirm(): Promise<boolean> {
  const answer = await prompt("Proceed? (y/N) ");
  return ["yes", "y"].includes(answer?.toLowerCase() ?? "no");
}

async function check(
  serving: Collections,
  questionIds: string[],
  formId: string,
  storyIds: string[]
) {
  const actualQuestions = await serving.questions
    .questionsRef()
    .select(FieldPath.documentId())
    .where(FieldPath.documentId(), "in", questionIds)
    .get();
  const actualQuestionIds = actualQuestions.docs.map((question) => question.id);
  const missingQuestionIds = questionIds.filter(
    (id) => !actualQuestionIds.includes(id)
  );
  if (missingQuestionIds.length > 0) {
    console.log(
      `ERROR: ${collectionInfo(serving.questions)} ` +
        `misses questions ${missingQuestionIds}. Please rerun this script.`
    );
  } else {
    console.log(
      `${collectionInfo(serving.questions)} has all the question documents ` +
        "(actual content was not checked)."
    );
  }

  const actualForm = await serving.forms.formRef(formId).get();
  if (!actualForm.exists) {
    console.log(
      `ERROR: ${collectionInfo(serving.forms)} misses form ${formId}. ` +
        "Please rerun this script."
    );
  } else {
    console.log(
      `${collectionInfo(serving.forms)} has the form ${formId} ` +
        "(actual content was not checked)."
    );
  }

  const actualStories = await serving.stories
    .storiesRef()
    .select(FieldPath.documentId())
    .where(FieldPath.documentId(), "in", storyIds)
    .get();
  const actualStoryIds = actualStories.docs.map((story) => story.id);
  const missingStoryIds = storyIds.filter((id) => !actualStoryIds.includes(id));
  if (missingStoryIds.length > 0) {
    console.log(
      `ERROR: ${collectionInfo(serving.stories)} ` +
        `misses stories ${missingStoryIds}. Please rerun this script.`
    );
  } else {
    console.log(
      `${collectionInfo(serving.stories)} has all the story documents ` +
        "(actual content was not checked)."
    );
  }

  // TODO: make a more thorough check. Ideally, this would be done in the
  // copiers (since they already know what the target data is).
}

main().then(() => process.exit(0));
