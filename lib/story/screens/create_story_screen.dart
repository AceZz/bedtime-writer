import 'dart:core';

import 'package:animated_text_kit/animated_text_kit.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../backend/concrete.dart';
import '../../backend/index.dart';
import '../../widgets/app_scaffold.dart';
import '../../widgets/lottie_loading.dart';
import '../states/create_story_state.dart';
import 'display_story_screen.dart';

/// Entry point of the story creation.
///
/// Depending on the current `CreateStoryState`, displays one among these:
/// * the current question
/// * a loading message
/// * the generated story
class CreateStoryScreen extends ConsumerWidget {
  const CreateStoryScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    CreateStoryState state = ref.watch(createStoryStateProvider);

    // Displays the current question.
    if (state.hasQuestions) {
      return _QuestionScreen(question: state.currentQuestion);
    }

    // Creates the story and displays it.
    return FutureBuilder(
      future: createClassicStory(state.storyParams),
      builder: (BuildContext context, AsyncSnapshot<String> snapshot) {
        final requestId = snapshot.data;
        return _StoryScreen(requestId: requestId);
      },
    );
  }
}

/// Displays the story screen.
class _StoryScreen extends ConsumerWidget {
  // We use a temporary widget instead of inlining the content of the build
  // method into `CreateStoryScreen.build`. That's because of a weird behaviour
  // with ref.watch, which triggers the future of `FutureBuilder` many times.
  final String? requestId;

  const _StoryScreen({Key? key, required this.requestId}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final _requestId = requestId;
    const loadingScreen = const _LoadingScreen();

    if (_requestId == null) {
      return loadingScreen;
    }

    final storyRequest = ref.watch(storyRequestProvider(_requestId));
    return storyRequest.when(
      data: (StoryRequest request) =>
          request.status == StoryRequestStatus.created
              ? DisplayStoryScreen(id: _requestId)
              : loadingScreen,
      error: (error, stackTrace) => const CircularProgressIndicator(),
      loading: () => loadingScreen,
    );
  }
}

/// Displays a loading screen.
class _LoadingScreen extends StatelessWidget {
  const _LoadingScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final double screenHeight = MediaQuery.of(context).size.height;
    return AppScaffold(
      showAppBar: false,
      child: Padding(
        padding: EdgeInsets.only(top: 0.3 * screenHeight),
        child: Column(
          children: [
            const LottieLoading(),
            SizedBox(
              height: 200,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 10),
                child: const _LoadingTexts(),
              ),
            )
          ],
        ),
      ),
    );
  }
}

/// Loads the loading texts from [assetFile] and displays a [maxNumLoadingTexts]
/// of them.
class _LoadingTexts extends StatelessWidget {
  static const String assetFile = 'assets/story/loading.txt';

  static const int maxNumLoadingTexts = 10;

  /// The first text that is shown. To avoid duplicates, it should not appear in
  /// [assetFile],
  static const String defaultText =
      'Your fairy tale will appear in a few seconds';

  const _LoadingTexts({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
      future: _texts(context),
      initialData: [defaultText],
      builder: (
        BuildContext context,
        AsyncSnapshot<Iterable<String>> snapshot,
      ) {
        final texts = snapshot.data;
        final textStyle = Theme.of(context).primaryTextTheme.bodyLarge;
        return texts != null
            ? _animatedTexts(texts, textStyle)
            : SizedBox.shrink();
      },
    );
  }

  /// Returns the loading texts from the corresponding asset file.
  Future<Iterable<String>> _texts(BuildContext context) async {
    final data = await DefaultAssetBundle.of(context).loadString(assetFile);
    var texts = data.split('\n');
    texts.shuffle();
    return [defaultText, ...texts.take(maxNumLoadingTexts)];
  }

  Widget _animatedTexts(Iterable<String> texts, TextStyle? textStyle) {
    final animatedTexts = texts
        .map(
          (text) => FadeAnimatedText(
            text,
            textAlign: TextAlign.center,
            textStyle: textStyle,
            duration: const Duration(milliseconds: 5000),
          ),
        )
        .toList();

    return AnimatedTextKit(
      animatedTexts: animatedTexts,
      pause: const Duration(milliseconds: 1000),
      repeatForever: true,
    );
  }
}

/// Displays a question.
class _QuestionScreen extends StatelessWidget {
  /// The maximum number of choices that can be displayed.
  static const maxNumChoices = 3;

  final Question question;

  const _QuestionScreen({
    Key? key,
    required this.question,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    Widget questionText = Padding(
      padding: const EdgeInsets.all(20),
      child: AutoSizeText(
        question.text,
        textAlign: TextAlign.center,
        style: Theme.of(context).primaryTextTheme.headlineMedium,
      ),
    );

    // Shuffles the choices for randomness
    List<Choice<dynamic>> questionChoices = List.from(question.choices);

    if (question.shuffleChoices) {
      questionChoices.shuffle();
    }

    List<Widget> choiceButtons = questionChoices
        .take(maxNumChoices)
        .map((choice) => _ChoiceButton(choice: choice))
        .toList();

    return AppScaffold(
      appBarTitle: 'New story',
      child: Column(
        mainAxisSize: MainAxisSize.max,
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Flexible(flex: 1, child: questionText),
          Flexible(flex: 3, child: Column(children: choiceButtons)),
        ],
      ),
    );
  }
}

/// Displays a [Choice]: [Choice.image] next to [Choice.text].
///
/// When clicking on this widget, the state is updated using the provided
/// [choice].
class _ChoiceButton extends ConsumerWidget {
  final Choice choice;

  const _ChoiceButton({Key? key, required this.choice}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    Size size = MediaQuery.of(context).size;
    double buttonWidth = 0.3 * size.width;
    double textWidth = 0.6 * size.width;

    var text = Container(
      width: textWidth,
      child: Padding(
        padding: const EdgeInsets.all(10),
        child: Text(
          choice.text,
          textAlign: TextAlign.center,
          style: Theme.of(context).primaryTextTheme.titleMedium,
        ),
      ),
    );

    return Padding(
      padding: const EdgeInsets.all(15),
      child: Container(
        width: buttonWidth + textWidth,
        child: Material(
          color: Theme.of(context).colorScheme.primary,
          elevation: 10,
          borderRadius: BorderRadius.circular(100),
          clipBehavior: Clip.antiAliasWithSaveLayer,
          child: InkWell(
            onTap: () {
              ref
                  .read(createStoryStateProvider.notifier)
                  .updateStoryParams(choice);
            },
            child: Ink(
              child: Row(
                children: [
                  Container(
                    width: buttonWidth,
                    child: ClipOval(child: choice.image),
                  ),
                  text,
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
