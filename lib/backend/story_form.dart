import 'package:flutter/material.dart';

/// A list of questions to generate a story.
///
/// We assume that [questions] comes in the order that they should be asked.
@immutable
class StoryForm {
  final List<Question> questions;

  const StoryForm({required this.questions});
}

/// A question of the story form.
///
/// We assume that [choices] comes in the order that they should be presented.
@immutable
class Question {
  final String id;
  final String text;
  final List<Choice> choices;

  const Question({required this.id, required this.text, required this.choices});
}

/// One of the choices of a [Question].
@immutable
class Choice {
  final String id;
  final String text;
  final Image? image;

  const Choice({required this.id, required this.text, this.image});
}

/// The answers to a story form.
///
/// Use [answer] to return a new [StoryAnswers] with an answer to a new
/// question, or a new answer to an existing question.
@immutable
class StoryAnswers {
  final Map<String, dynamic> answers;

  const StoryAnswers({required this.answers});

  StoryAnswers answer(Question question, Choice choice) {
    return StoryAnswers(answers: {
      ...answers,
      question.id: choice.id,
    });
  }

  Map<String, dynamic> serialize() {
    return answers;
  }
}
