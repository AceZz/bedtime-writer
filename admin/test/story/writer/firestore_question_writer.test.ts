import { beforeAll, expect, beforeEach, test } from "@jest/globals";
import { DocumentReference, getFirestore } from "firebase-admin/firestore";
import { initFirebase } from "../../../src/firebase_utils";
import { FirestoreQuestionWriter } from "../../../src/story/writer/firestore_question_writer";
import { Question } from "../../../src/story/question";
import { Choice } from "../../../src/story/choice";

// Use a test collection to avoid erasing production data.
const COLLECTION_NAME = "test__story__questions";

const getWriter = () => new FirestoreQuestionWriter(COLLECTION_NAME);

const QUESTIONS_1: Question[] = [
  new Question("question1", "Question 1", [
    new Choice("choice1", "Choice 1", "test/story/data/choice.jpg"),
    new Choice("choice2", "Choice 2", "test/story/data/choice.jpg"),
  ]),
  new Question("question2", "Question 2", [
    new Choice("choice1", "Choice 1", "test/story/data/choice.jpg"),
    new Choice("choice2", "Choice 2", "test/story/data/choice.jpg"),
  ]),
];

// `QUESTIONS_2` is `QUESTIONS_1` but:
// * `question_1` has another text, one of its choices was modified, one of its
//   choices was replaced by another
// * `question2` was replaced by `question3`

const QUESTIONS_2: Question[] = [
  new Question("question1", "New question 1", [
    new Choice("choice1", "New choice 1", "test/story/data/choice.jpg"),
    new Choice("choice3", "Choice 3", "test/story/data/choice.jpg"),
  ]),
  new Question("question3", "Question 3", [
    new Choice("choice1", "Choice 1", "test/story/data/choice.jpg"),
    new Choice("choice2", "Choice 2", "test/story/data/choice.jpg"),
  ]),
];

// Check we are running in emulator mode before initializing Firebase.
beforeAll(() => {
  initFirebase(true);
});

// Empty the collection before each test.
beforeEach(async () => {
  const firestore = getFirestore();
  const questions = await firestore.collection(COLLECTION_NAME).get();
  await Promise.all(
    questions.docs.map((question) => deleteQuestion(question.ref))
  );
});

async function deleteQuestion(question: DocumentReference): Promise<void> {
  await deleteChoices(question);
  await question.delete();
}

async function deleteChoices(question: DocumentReference): Promise<void> {
  const choices = await question.collection("choices").get();
  await Promise.all(
    choices.docs.map((choice) => {
      choice.ref.delete();
    })
  );
}

test("Simple write", async () => {
  const writer = getWriter();
  await writer.write(QUESTIONS_1);

  await expectQuestionsToBe(QUESTIONS_1);
});

test("Complex write", async () => {
  const writer = getWriter();
  await writer.write(QUESTIONS_1);
  await writer.write(QUESTIONS_2);

  await expectQuestionsToBe(QUESTIONS_2);
});

test("Write twice", async () => {
  const writer = getWriter();
  await writer.write(QUESTIONS_1);
  await writer.write(QUESTIONS_1);

  await expectQuestionsToBe(QUESTIONS_1);
});

async function expectQuestionsToBe(expected: Question[]) {
  const firestore = getFirestore();
  const questions = firestore.collection(COLLECTION_NAME);

  // Test each question.
  await Promise.all(
    expected.map((expectedQuestion) =>
      expectQuestionToBe(questions.doc(expectedQuestion.id), expectedQuestion)
    )
  );

  // Test the number of questions.
  const countQuery = await questions.count().get();
  expect(countQuery.data().count).toBe(expected.length);
}

async function expectQuestionToBe(
  document: DocumentReference,
  expected: Question
) {
  // Test the question's data.
  const data = (await document.get()).data();
  expect(data?.text).toBe(expected.text);

  // Test each choice.
  const choices = document.collection("choices");
  await Promise.all(
    expected.choices.map((expectedChoice) =>
      expectChoiceToBe(choices.doc(expectedChoice.id), expectedChoice)
    )
  );

  // Test the number of choices.
  const countQuery = await choices.count().get();
  expect(countQuery.data().count).toBe(expected.choices.length);
}

async function expectChoiceToBe(document: DocumentReference, expected: Choice) {
  const data = (await document.get()).data();
  expect(data?.image).toStrictEqual(await expected.image());
  expect(data?.text).toBe(expected.text);
}
