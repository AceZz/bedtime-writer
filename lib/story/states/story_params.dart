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

  String get _descriptionFlaw => flaw == null ? '' : ' It has a flaw: $flaw.';

  String get _descriptionPower =>
      power == null ? '' : ' It has a power: $power.';

  String get _descriptionChallenge =>
      challenge == null ? '' : ' It will be challenged with $challenge.';

  /// Returns a description of this character, suitable for insertion into a
  /// prompt.
  String get description =>
      ' The main character of the story is $name, a $type.'
      '$_descriptionFlaw'
      '$_descriptionPower'
      '$_descriptionChallenge';
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
  final String style;
  final Character? character;

  /// The age of the child.
  final int? age;
  final int? duration;
  final String? place;
  final String? object;
  final String? moral;

  const StoryParams({
    required this.style,
    this.character,
    this.age,
    this.duration,
    this.place,
    this.object,
    this.moral,
  });

  StoryParams copyWith({
    Character? character,
    int? age,
    int? duration,
    String? place,
    String? object,
    String? moral,
  }) {
    return StoryParams(
      style: this.style,
      character: character ?? this.character,
      age: age ?? this.age,
      duration: duration ?? this.duration,
      place: place ?? this.place,
      object: object ?? this.object,
      moral: moral ?? this.moral,
    );
  }

  String get _promptStyle => ' in the style of $style.';

  //TODO: Convert to words
  String get _promptDuration =>
      duration == null ? '' : ' It should last about $duration minutes.';

  String get _promptPlace => place == null ? '' : ' The story happens $place.';

  String get _promptObject =>
      object == null ? '' : ' This object shall be important: $object.';

  String get _promptMoral => moral == null
      ? ''
      : ' The story shall end with this moral: $moral.';

  /// Returns a prompt for this story.
  //TODO: Rewrite prompt
  String get prompt =>
      'Write a fairy tale,$_promptStyle'
      '$_promptDuration'
      '${character?.description ?? ""}'
      '$_promptPlace'
      '$_promptObject'
      '$_promptMoral';

  /// Returns a title for this story.
  String get title =>
      character == null ? "Tonight's story" : "The story of ${character?.name}";

  String get _imagePromptType {
    var type = character?.type;
    return type == null ? '.' : ' of a $type.';
  }

  String get _imagePromptPlace =>
      place == null ? '' : ' It takes place $place.';

  /// Returns an image prompt for this story.
  String get imagePrompt => 'Dreamy and whimsical beautiful illustration'
      '$_imagePromptType'
      '$_imagePromptPlace';
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
