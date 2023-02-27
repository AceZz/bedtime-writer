import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../widgets/app_scaffold.dart';
import '../../widgets/lottie_loading.dart';
import '../../widgets/share_button.dart';
import '../../widgets/favorite_button.dart';
import '../backend/api_calls.dart';
import '../states/create_story_state.dart';
import '../states/story_params.dart';
import 'story_image.dart';
import 'story_widget.dart';

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
    var story = state.story;
    var storyImage = state.storyImage;

    // Displays the story.
    if (story != null && storyImage != null) {
      var payload = savePayload(
        title: state.storyParams.title,
        story: story,
        storyImage: storyImage,
        prompt: state.storyParams.prompt,
        imagePrompt: state.storyParams.imagePrompt,
      );

      Widget saveButton = FavoriteButton(
        payload: payload,
        iconSize: 30,
      );

      Widget shareButton = ShareButton(
        iconSize: 30,
        text: 'Hey! Check out this amazing story I made with '
            'Bedtime stories: \n\n $story',
      );

      return AppScaffold(
        appBarTitle: 'Story',
        scrollableAppBar: true,
        actions: [saveButton, shareButton],
        child: StoryWidget(
          title: payload.title,
          story: payload.story,
          image: StoryImage(url: payload.storyImage, width: 380, height: 380),
        ),
      );
    }

    // Displays a loading screen.
    if (!state.hasQuestions) {
      // On page load action.
      SchedulerBinding.instance.addPostFrameCallback((_) async {
        String storyText;
        String storyImage;

        try {
          // Parallelization of API calls
          var apiResults = await Future.wait([
            callOpenAiTextGeneration(prompt: state.storyParams.prompt),
            callOpenAiImageGeneration(prompt: state.storyParams.imagePrompt)
          ]);

          storyText = apiResults[0];
          storyImage = apiResults[1];
        } catch (e) {
          storyText = 'Sorry, your story could not be generated';
          storyImage = '';
        }

        ref
            .read(createStoryStateProvider.notifier)
            .setStory(storyText, storyImage);
      });

      return AppScaffold(
        child: _LoadingContent(),
        showAppBar: false,
      );
    }

    // Displays the current question.
    return AppScaffold(
        appBarTitle: 'New story',
        child: _QuestionContent(question: state.currentQuestion));
  }
}

/// Displays a loading screen.
class _LoadingContent extends ConsumerWidget {
  const _LoadingContent({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Column(
      mainAxisSize: MainAxisSize.max,
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        LottieLoading(),
        Text(
          'Your story is being created...',
          style: Theme.of(context).primaryTextTheme.headlineSmall,
        ),
      ],
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
    questionChoices.shuffle();

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
