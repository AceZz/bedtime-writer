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

const List<String> loadingTextList = [
  'The dragon is sleeping soundly in his lair',
  'The fairies are dancing and singing in the moonlight',
  'A wish is being granted by a magical genie',
  'The wicked witch is cackling with glee over her latest scheme',
  'The seven dwarves are whistling while they work in the mines',
  'The mermaid is splashing playfully in the waves',
  'A majestic unicorn is galloping through a field of wildflowers',
  'The giant is grumbling in his sleep, dreaming of his next meal',
  'The goblin is hoarding his stolen treasure in a secret hideout',
  'The wise wizard is studying ancient tomes of magic in his tower',
  'A group of talking animals are planning a daring adventure',
  'The enchanted forest is alive with whispers and secrets',
  'An enchanted rose is slowly losing its petals in a lonely castle',
  'A brave prince is fighting a fierce dragon to save his true love',
  'A magical tea party is happening in a hidden grove, hosted by the fairies',
  'In the mist and mystery, a castle looms in the distance',
  'With a wave of her wand, the fairy godmother prepares to grant a lucky soul\'s wish',
  'The future is glimpsed in the enchanted mirror',
  'The kingdom is in darkness, and a hero sets out to save it',
  'The wicked stepmother cackles as she plots her next move',
  'A cursed prince searches for true love\'s kiss to break the spell',
  'The magical beanstalk dares adventurers to climb high into the clouds',
  'A brave knight battles a fierce dragon to save the princess',
  'Mischievous pixies play pranks on unsuspecting travelers',
  'A powerful sorcerer summons the elements to do his bidding',
  'Eerie shadows and whispers fill the haunted woods',
  'Mythical mermaids sing hauntingly beautiful songs',
  'The fairy queen dances gracefully in a moonlit glade',
  'Ancient creatures and untold secrets hide in the treacherous sea',
  'A wise old wizard dispenses cryptic advice',
];

const int numberLoadingText = 10;

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
      padding: EdgeInsets.only(top: 0.3 * screenHeight),
      child: Column(
        children: [
          LottieLoading(),
          SizedBox(
            child: Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 10),
                child: _AnimatedText(),
              ),
            ),
          )
        ],
      ),
    );
  }
}

/// Creates animated text for loading screen
class _AnimatedText extends StatelessWidget {
  const _AnimatedText({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final List<String> loadingTextListCopy = List.from(loadingTextList);
    loadingTextListCopy.shuffle();
    final List<String> loadingTextRandomList =
        loadingTextListCopy.take(numberLoadingText).toList();
    final List<dynamic> rotateAnimatedTextList = loadingTextRandomList
        .map((x) => _stringToRotateAnimatedText(x, context))
        .toList();

    return AnimatedTextKit(
      animatedTexts: [
        _stringToRotateAnimatedText(
          'Your fairy tale will arrive in about 30 seconds',
          context,
        ),
        ...rotateAnimatedTextList,
      ],
      pause: const Duration(milliseconds: 1000),
      repeatForever: true,
    );
  }
}

/// Returns a rotate animate text from a string
RotateAnimatedText _stringToRotateAnimatedText(
    String text, BuildContext context) {
  return RotateAnimatedText(
    text,
    textAlign: TextAlign.center,
    textStyle: Theme.of(context).primaryTextTheme.bodyLarge,
    duration: const Duration(milliseconds: 4000),
  );
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
