import 'dart:math';

import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../backend/index.dart';

const List<String> _styles = [
  'the Arabian Nights',
  'Hans Christian Andersen',
  'the Brothers Grimm',
  'Charles Perrault',
];

String _getRandomStyle() => _styles[Random().nextInt(_styles.length)];

/// A state that contains a [StoryForm] and a [StoryAnswers].
@immutable
class CreateStoryState {
  final StoryForm storyForm;
  final StoryAnswers storyAnswers;
  final int currentQuestionIndex;

  const CreateStoryState._internal(
    this.storyForm,
    this.storyAnswers,
    this.currentQuestionIndex,
  );

  factory CreateStoryState({
    required StoryForm storyForm,
    required int duration,
  }) {
    final Map<String, dynamic> answers = {
      'style': _getRandomStyle(),
      'duration': duration,
    };

    return CreateStoryState._internal(
      storyForm,
      StoryAnswers(answers: answers),
      0,
    );
  }

  bool get hasRemainingQuestions =>
      currentQuestionIndex < storyForm.questions.length;

  Question get currentQuestion => storyForm.questions[currentQuestionIndex];

  /// Returns a new [CreateStoryState] with an answer to the current question.
  ///
  /// If there are no remaining questions, returns this object as is.
  CreateStoryState answerCurrentQuestion(Choice choice) {
    if (!hasRemainingQuestions) return this;

    return CreateStoryState._internal(
      storyForm,
      storyAnswers.answer(currentQuestion, choice),
      currentQuestionIndex + 1,
    );
  }
}

class CreateStoryStateNotifier extends StateNotifier<CreateStoryState> {
  final Ref ref;

  CreateStoryStateNotifier({required this.ref})
      : super(
          CreateStoryState(
            storyForm: ref.read(storyFormProvider),
            duration: 5,
          ),
        );

  void reset() {
    final Preferences preferences = ref.read(preferencesProvider);

    state = CreateStoryState(
      storyForm: ref.read(storyFormProvider),
      duration: preferences.duration,
    );
  }

  /// Updates the story, as done by [CreateStoryState.answerCurrentQuestion].
  void answerCurrentQuestion(Choice choice) {
    state = state.answerCurrentQuestion(choice);
  }
}

final createStoryStateProvider =
    StateNotifierProvider<CreateStoryStateNotifier, CreateStoryState>(
  (ref) => CreateStoryStateNotifier(ref: ref),
);
