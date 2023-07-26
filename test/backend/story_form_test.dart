import 'dart:typed_data';

import 'package:bedtime_writer/backend/story_form.dart';
import 'package:test/test.dart';

class _Question implements Question {
  final String id;
  final String text;
  final List<Choice> choices;

  const _Question(
      {required this.id, required this.text, required this.choices});
}

class _Choice implements Choice {
  final String id;
  final String text;
  final Uint8List? image = null;

  const _Choice({required this.id, required this.text});
}

const question_1 = _Question(
  id: 'question_1',
  text: 'Question 1',
  choices: [
    _Choice(id: 'choice_1', text: 'Choice 1'),
    _Choice(id: 'choice_2', text: 'Choice 2'),
  ],
);

const question_2 = _Question(
  id: 'question_2',
  text: 'Question 2',
  choices: [
    _Choice(id: 'choice_3', text: 'Choice 3'),
    _Choice(id: 'choice_4', text: 'Choice 4'),
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
