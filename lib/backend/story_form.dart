import 'dart:typed_data';

import 'package:flutter/material.dart';

import '../utils.dart';

/// A list of questions to generate a story.
///
/// We assume that [questions] comes in the order that they should be asked.
@immutable
abstract class StoryForm {
  String get id;

  List<Question> get questions;
}

/// A question of the story form.
///
/// We assume that [choices] comes in the order that they should be presented.
@immutable
abstract class Question {
  String get id;

  String get text;

  List<Choice> get choices;
}

/// One of the choices of a [Question].
///
/// Note: we require [image] NOT to be a Future, to force loading before use.
@immutable
abstract class Choice {
  String get id;

  String get text;

  Uint8List? get image;
}

/// The answers to a story form.
///
/// Use [answer] to return a new [StoryAnswers] with an answer to a new
/// question, or a new answer to an existing question.
@immutable
class StoryAnswers {
  final DynMap answers;

  const StoryAnswers({required this.answers});

  StoryAnswers answer(Question question, Choice choice) {
    return StoryAnswers(
      answers: {
        ...answers,
        question.id: choice.id,
      },
    );
  }

  DynMap serialize() {
    return answers;
  }
}
