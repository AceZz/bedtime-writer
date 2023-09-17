import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../backend/concrete.dart';
import '../../backend/index.dart';

/// A state that contains a [StoryForm] and a [StoryAnswers].
@immutable
class CreateStoryState {
  final StoryForm? _storyForm;
  final StoryAnswers storyAnswers;
  final int currentQuestionIndex;

  const CreateStoryState._internal(
    this._storyForm,
    this.storyAnswers,
    this.currentQuestionIndex,
  );

  factory CreateStoryState({
    required StoryForm? storyForm,
  }) {
    final Map<String, dynamic> answers = {};

    return CreateStoryState._internal(
      storyForm,
      StoryAnswers(answers: answers),
      0,
    );
  }

  StoryForm get storyForm => _storyForm!;

  /// If true, the story form has been loaded and can be used.
  bool get hasStoryForm => _storyForm != null;

  bool get hasRemainingQuestions =>
      currentQuestionIndex < storyForm.questions.length;

  Question get currentQuestion => storyForm.questions[currentQuestionIndex];

  /// Returns a new [CreateStoryState] with an answer to the current question.
  ///
  /// If there are no remaining questions, returns this object as is.
  CreateStoryState answerCurrentQuestion(Choice choice) {
    if (!hasRemainingQuestions) return this;

    return CreateStoryState._internal(
      _storyForm,
      storyAnswers.answer(currentQuestion, choice),
      currentQuestionIndex + 1,
    );
  }

  Map<String, dynamic> serialize() {
    return {'formId': storyForm.id, ...storyAnswers.serialize()};
  }
}

class CreateStoryStateNotifier extends StateNotifier<CreateStoryState> {
  final Ref ref;

  CreateStoryStateNotifier({required this.ref})
      : super(CreateStoryState(storyForm: null));

  void reset() {
    state = CreateStoryState(storyForm: null);
  }

  Future<void> loadStoryForm() async {
    state = CreateStoryState(
      storyForm: await getRandomStoryForm(),
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
