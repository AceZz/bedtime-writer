import 'dart:core';

import 'package:animated_text_kit/animated_text_kit.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../backend/concrete.dart';
import '../../backend/index.dart';
import '../../config.dart';
import '../../widgets/app_scaffold.dart';
import '../../widgets/lottie_loading.dart';
import '../states/create_story_state.dart';
import 'display_story_screen.dart';
import 'error_screen.dart';

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
    User user = ref.watch(userProvider);
    Preferences preferences = ref.watch(preferencesProvider);

    Widget nextScreen;

    final isAnonymousBlocked =
        (user is AnonymousUser) && preferences.hasLoggedOut;
    final isUnauth = (user is UnauthUser);
    final String limitReachedText = (isAnonymousBlocked || isUnauth)
        ? "Your storytelling magic has reached its limit. Sign in to discover a new set of stories."
        : "Your storytelling magic has reached its limit. Come back to Dreamy Tales tomorrow to discover a new set of stories.";

    // Loads the [StoryForm] if needed.
    if (!state.hasStoryForm) {
      return FutureBuilder(
        future: ref.read(createStoryStateProvider.notifier).loadStoryForm(),
        builder: (BuildContext context, AsyncSnapshot<void> snapshot) {
          return _LoadingScreen(
            firstText: "Please wait while we are crafting magical questions...",
          );
        },
      );
    }

    // Checks on stories limit and displays a question
    if (state.hasRemainingQuestions) {
      nextScreen = _QuestionScreen(question: state.currentQuestion);
      return _LimitCheckScreen(
        limitReachedScreen: ErrorScreen(text: limitReachedText),
        nextScreen: nextScreen,
      );
    }
    // Creates and displays story after questions have been answered
    else {
      return FutureBuilder(
        future: createClassicStory(state.storyAnswers),
        builder: (BuildContext context, AsyncSnapshot<String> snapshot) {
          final requestId = snapshot.data;
          return _StoryScreen(requestId: requestId);
        },
      );
    }
  }
}

/// Checks the stories limit and redirects towards a nextScreen or errorScreen
class _LimitCheckScreen extends ConsumerWidget {
  final Widget limitReachedScreen;
  final Widget nextScreen;

  const _LimitCheckScreen(
      {Key? key, required this.limitReachedScreen, required this.nextScreen})
      : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    AsyncValue<Stats> stats = ref.watch(statsProvider);

    Widget limitCheckWidget = stats.when(
      loading: () => const CircularProgressIndicator(),
      error: (err, stack) => ErrorScreen(
          text:
              'An error happened during limit check: $err. Please try again.'),
      data: (stats) {
        // If user has enough remaining stories, proceed with story creation
        if (stats.remainingStories >= 1) {
          return this.nextScreen;
        }
        // Else display limitReachScreen
        else {
          return this.limitReachedScreen;
        }
      },
    );

    return limitCheckWidget;
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

    const failedLoadingText =
        'A mystical force seems to have interrupted your story.\n\nLet\'s try creating your dreamy tale again:';

    return ref.watch(
      storyStatusProvider(_requestId).select(
        (status) => status.when(
          data: (StoryStatus status) {
            switch (status) {
              case StoryStatus.generating:
              case StoryStatus.complete:
                return DisplayStoryScreen(id: _requestId);
              case StoryStatus.pending:
                return loadingScreen;
              case StoryStatus.error:
                final errorText = debugStory()
                    ? 'Error: StoryStatus.error'
                    : failedLoadingText;
                return ErrorScreen(text: errorText);
            }
          },
          error: (error, stackTrace) {
            final errorText =
                debugStory() ? 'Error: $error' : failedLoadingText;
            return ErrorScreen(text: errorText);
          },
          loading: () => loadingScreen,
          skipLoadingOnReload: true,
        ),
      ),
    );
  }
}

/// Displays a loading screen.
class _LoadingScreen extends StatelessWidget {
  final String firstText;

  const _LoadingScreen({
    Key? key,
    this.firstText = 'Your fairy tale will appear in a few seconds',
  }) : super(key: key);

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
                padding: const EdgeInsets.symmetric(horizontal: 30),
                child: _LoadingTexts(firstText: firstText),
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
  /// [assetFile].
  final String firstText;

  const _LoadingTexts({Key? key, required this.firstText}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
      future: _texts(context),
      initialData: [firstText],
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
    texts = texts.where((string) => string.isNotEmpty).toList();
    texts.shuffle();
    return [firstText, ...texts.take(maxNumLoadingTexts)];
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
      child: Text(
        question.text,
        textAlign: TextAlign.center,
        style: Theme.of(context).primaryTextTheme.headlineMedium,
      ),
    );

    List<Widget> choiceButtons = question.choices
        .take(maxNumChoices)
        .map((choice) => _ChoiceButton(choice: choice))
        .toList();

    return AppScaffold(
      appBarTitle: 'New story',
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.max,
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            questionText,
            Column(children: choiceButtons),
          ],
        ),
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
    double textWidth = 0.5 * size.width;

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
                  .answerCurrentQuestion(choice);
            },
            child: Ink(
              child: Row(
                children: [
                  if (choice.image != null)
                    Container(
                      width: buttonWidth,
                      child: ClipOval(child: Image.memory(choice.image!)),
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
