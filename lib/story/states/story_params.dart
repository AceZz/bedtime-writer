import 'dart:math';

import 'package:flutter/material.dart';

final _random = new Random();

/// The character of the story.
///
/// This class is immutable. Use [copyWith] to return a new object with some of
/// its fields updated.
///
/// Use [description] to get a description of this character. Even if some of
/// the fields are not initialized, a consistent description should be produced.
@immutable
class Character {
  final String name;
  final String type;
  final String? flaw;
  final String? power;
  final String? challenge;

  const Character({
    required this.name,
    required this.type,
    this.flaw,
    this.power,
    this.challenge,
  });

  Character copyWith({String? flaw, String? power, String? challenge}) {
    return Character(
      name: this.name,
      type: this.type,
      flaw: flaw ?? this.flaw,
      power: power ?? this.power,
      challenge: challenge ?? this.challenge,
    );
  }

  Map<String, dynamic> serialize() {
    var map = {
      'name': name,
      'type': type,
      'flaw': flaw,
      'power': power,
      'challenge': challenge,
    };
    map.removeWhere((key, value) => value == null);

    return map;
  }
}

/// Parameters for generating a story.
///
/// This class is immutable. Use [copyWith] to return a new object with some of
/// its fields updated.
///
/// Use [prompt] to get a prompt for the story. Even if some of
/// the fields are not initialized, a consistent prompt should be produced.
@immutable
class StoryParams {
  final String? style;
  final Character? character;

  /// The age of the child.
  final int? duration;
  final String? place;
  final String? object;
  final String? moral;

  const StoryParams({
    this.style,
    this.character,
    this.duration,
    this.place,
    this.object,
    this.moral,
  });

  StoryParams copyWith({
    String? style,
    Character? character,
    int? duration,
    String? place,
    String? object,
    String? moral,
  }) {
    return StoryParams(
      style: style ?? this.style,
      character: character ?? this.character,
      duration: duration ?? this.duration,
      place: place ?? this.place,
      object: object ?? this.object,
      moral: moral ?? this.moral,
    );
  }

  Map<String, dynamic> serialize() {
    var map = {
      'style': style,
      'character': character?.serialize(),
      'duration': duration,
      'place': place,
      'object': object,
      'moral': moral,
    };
    map.removeWhere((key, value) => value == null);

    return map;
  }
}

void _defaultIsAvailable(StoryParams story) => true;

/// One of the choices of a [Question].
///
/// This class has a [text] which is displayed to the user. Use the
/// [isAvailable] function to decide whether this choice should be available,
/// depending on the current story parameters.
@immutable
class Choice<T> {
  final String text;
  final T value;
  final Image? image;

  /// Whether this choice should be available. Defaults to true.
  final Function(StoryParams story) isAvailable;

  const Choice({
    required this.text,
    required this.value,
    this.image,
    this.isAvailable = _defaultIsAvailable,
  });
}

/// A question to choose a story parameter.
///
/// Given a [StoryParams] object, access the available choices with
/// [availableChoices].
///
/// Use [answer] to obtain a new [StoryParams] object for a given [Choice]. The
/// choice can also be made randomly, with [answerRandom].
@immutable
class Question {
  final String text;
  final List<Choice> choices;
  final StoryParams Function(StoryParams story, Choice choice) answer;
  final bool shuffleChoices;

  /// Whether this question can be answered randomly.
  ///
  /// This is merely an informational attribute. It does not affect the
  /// behaviour of [answerRandom].
  final bool randomAllowed;

  const Question({
    required this.text,
    required this.choices,
    required this.answer,
    this.randomAllowed = true,
    this.shuffleChoices = true,
  });

  List<Choice> availableChoices(StoryParams story) =>
      choices.where((choice) => choice.isAvailable(story)).toList();

  /// Answers the question with one of its valid choices, randomly selected.
  ///
  /// If no choice is valid, return the story, unmodified. Does not take
  /// [randomAllowed] into account.
  StoryParams answerRandom(StoryParams story) {
    var choices = availableChoices(story);
    return choices.isEmpty
        ? story
        : answer(story, choices[_random.nextInt(choices.length)]);
  }
}
