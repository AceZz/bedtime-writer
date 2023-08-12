import 'package:bedtime_writer/backend/story_form.dart';
import 'package:test/test.dart';

const question_1 = Question(
  id: 'question_1',
  text: 'Question 1',
  choices: [
    Choice(id: 'choice_1', text: 'Choice 1'),
    Choice(id: 'choice_2', text: 'Choice 2'),
  ],
);

const question_2 = Question(
  id: 'question_2',
  text: 'Question 2',
  choices: [
    Choice(id: 'choice_3', text: 'Choice 3'),
    Choice(id: 'choice_4', text: 'Choice 4'),
  ],
);

void main() {
  group('StoryAnswers', () {
    test('.answer()', () {
      var answers = const StoryAnswers(answers: {});

      answers = answers.answer(question_1, question_1.choices[0]);

      expect(answers.answers, {'question_1': 'choice_1'});
    });

    test('.serialize()', () {
      var answers = const StoryAnswers(answers: {});

      answers = answers.answer(question_1, question_1.choices[0]);
      answers = answers.answer(question_2, question_2.choices[1]);

      expect(answers.serialize(), {
        'question_1': 'choice_1',
        'question_2': 'choice_4',
      });
    });
  });
}
