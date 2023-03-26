import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

import 'package:animated_text_kit/animated_text_kit.dart';

import 'dart:core';
import '../../backend.dart';
import '../../widgets/app_scaffold.dart';
import '../../widgets/lottie_loading.dart';
import '../states/create_story_state.dart';
import '../states/story_params.dart';
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

    final debugLoading = dotenv.get('DEBUG_LOADING', fallback: 'false');

    print(debugLoading);

    if (debugLoading == 'true') {
      // Creates infinite loading for debug
      return AppScaffold(
        showAppBar: false,
        child: _LoadingContent(),
      );
    }

    if (state.hasQuestions) {
      // Displays the current question.
      return AppScaffold(
        appBarTitle: 'New story',
        child: _QuestionContent(question: state.currentQuestion),
      );
    }

    // Adds the story and displays it.
    return FutureBuilder(
      future: addStory(state.storyParams),
      builder: (BuildContext context, AsyncSnapshot<String> snapshot) {
        final generatedStoryId = snapshot.data;
        return generatedStoryId == null
            ? AppScaffold(
                showAppBar: false,
                child: _LoadingContent(),
              )
            : DisplayStoryScreen(
                id: generatedStoryId,
              );
      },
    );
  }
}

/// Displays a loading screen.
class _LoadingContent extends ConsumerWidget {
  const _LoadingContent({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final double screenHeight = MediaQuery.of(context).size.height;
    return Padding(
      padding: EdgeInsets.only(top:0.3*screenHeight),
      child: Column(
        children: [
          LottieLoading(),
          SizedBox(
            child: Center(
              child: AnimatedTextKit(
                animatedTexts: [
                  RotateAnimatedText('Your fairy tale will arrive in about 30 seconds', textStyle: Theme.of(context).primaryTextTheme.bodyMedium,),
                  RotateAnimatedText('Fairies are dancing around', textStyle: Theme.of(context).primaryTextTheme.bodyMedium,),
                  RotateAnimatedText('The dragon goes back to sleep', textStyle: Theme.of(context).primaryTextTheme.bodyMedium,),
                ],
              ),
            ),
          )
        ],
      ),
    );
  }
}

/// Displays a question.
class _QuestionContent extends StatelessWidget {
  /// The maximum number of choices that can be displayed.
  static const maxNumChoices = 3;

  final Question question;

  const _QuestionContent({
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

    // Shuffles the choices for randomness
    List<Choice<dynamic>> questionChoices = List.from(question.choices);

    if (question.shuffleChoices) {
      questionChoices.shuffle();
    }

    List<Widget> choiceButtons = questionChoices
        .take(maxNumChoices)
        .map((choice) => _ChoiceButton(choice: choice))
        .toList();

    return Column(
      mainAxisSize: MainAxisSize.max,
      mainAxisAlignment: MainAxisAlignment.start,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        questionText,
        ...choiceButtons,
      ],
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
      padding: const EdgeInsets.all(20),
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
