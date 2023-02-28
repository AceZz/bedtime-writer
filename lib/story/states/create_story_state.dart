import 'dart:math';

import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'data.dart';
import 'story_params.dart';

final _random = new Random();

/// List of writing styles.
const List<String> _styles = [
  'the Arabian Nights',
  'Hans Christian Andersen',
  'the Brothers Grimm',
  'Charles Perrault',
];

/// State for the story creation feature.
///
/// This object contains a [StoryParams] and a queue of [questions]. It can
/// [update] its [StoryParams] by answering the questions in the
/// queue, either with a provided [Choice] or randomly.
///
/// The maximum number of randomly answered questions is controlled by
/// [numRandom].
///
/// When the story is generated, the result is stored in [story].
@immutable
class CreateStoryState {
  final StoryParams storyParams;

  final List<Question> questions;

  /// Maximum number of questions which can be answered randomly.
  final int numRandom;

  /// The content of the story.
  final String? story;

  /// The URL to the story image.
  final String? storyImage;

  const CreateStoryState({
    required this.storyParams,
    required this.questions,
    required this.numRandom,
    required this.story,
    required this.storyImage,
  });

  bool get hasQuestions => this.questions.isNotEmpty;

  Question get currentQuestion => this.questions.first;

  CreateStoryState copyWith({
    StoryParams? storyParams,
    List<Question>? questions,
    int? numRandom,
    String? story,
    String? storyImage,
  }) {
    return CreateStoryState(
      storyParams: storyParams ?? this.storyParams,
      questions: questions ?? this.questions,
      numRandom: numRandom ?? this.numRandom,
      story: story ?? this.story,
      storyImage: storyImage ?? this.storyImage,
    );
  }

  /// Answers the [currentQuestion] question.
  ///
  /// If [choice] is provided, answers the [currentQuestion] with it.
  /// Otherwise, answers randomly.
  CreateStoryState _answer(Choice? choice) {
    // No question, so no answer.
    if (!hasQuestions) return this;

    if (choice == null) {
      // Answer randomly.
      return copyWith(
        storyParams: currentQuestion.answerRandom(storyParams),
        questions: questions.sublist(1),
        numRandom: numRandom - 1,
      );
    }

    return copyWith(
      storyParams: currentQuestion.answer(storyParams, choice),
      questions: questions.sublist(1),
    );
  }

  /// Updates the [story].
  ///
  /// If a [choice] is provided, answers the [currentQuestion] with it.
  ///
  /// In all cases, tries to answer the following questions randomly.
  /// To decide whether a question should be answered randomly, a random draw is
  /// made, taking the number of remaining questions into account.
  CreateStoryState update([Choice? choice]) {
    var newState = this;

    if (choice != null) newState = _answer(choice);

    while (newState.numRandom > 0 && newState.hasQuestions) {
      // We randomly pick one of the following indices:
      // | 0 | 1 | 2 | ... | newState.numRandom | ... | numRandomQuestions - 1 |
      // If it's less than newState.numRandom, the question is answered
      // randomly.
      var numRandomQuestions =
          newState.questions.where((question) => question.randomAllowed).length;
      var answerRandomly = newState.currentQuestion.randomAllowed &&
          _random.nextInt(numRandomQuestions) < newState.numRandom;

      if (answerRandomly) {
        newState = newState._answer(null);
      } else {
        // The question will not be answered randomly. We stop updating the
        // story parameters.
        break;
      }
    }

    return newState;
  }
}

class CreateStoryStateNotifier extends StateNotifier<CreateStoryState> {
  CreateStoryStateNotifier()
      : super(CreateStoryState(
          storyParams: StoryParams(style: ''),
          questions: [],
          numRandom: 0,
          story: null,
          storyImage: null,
        ));

  String _getRandomStyle() {
    final int randomIndex = Random().nextInt(_styles.length);
    return _styles[randomIndex];
  }

  List<Question> _getSampleQuestions() {
    List<Question> variableQuestions = [
      placeQuestion,
      objectQuestion,
      powerQuestion,
      flawQuestion,
      challengeQuestion,
      moralQuestion,
    ];
    variableQuestions.shuffle();
    List<Question> sampleQuestions = variableQuestions.take(2).toList();
    return [characterQuestion, ...sampleQuestions, durationQuestion];
  }

  /// Reset the StoryState.
  void reset() async {
    final prefs = await SharedPreferences.getInstance();
    final style = _getRandomStyle();
    final sampleQuestions = _getSampleQuestions();
    state = CreateStoryState(
      storyParams: StoryParams(
        age: prefs.getInt('age') ?? 5,
        style: style,
      ),
      questions: sampleQuestions,
      numRandom: 0,
      story: null,
      storyImage: null,
    );
  }

  /// Updates the story, as done by [CreateStoryState.update].
  void updateStoryParams([Choice? choice]) {
    state = state.update(choice);
  }

  /// Sets the story and the story image.
  void setStory(String story, String storyImage) {
    state = state.copyWith(story: story, storyImage: storyImage);
  }
}

final createStoryStateProvider =
    StateNotifierProvider<CreateStoryStateNotifier, CreateStoryState>(
        (ref) => CreateStoryStateNotifier());
