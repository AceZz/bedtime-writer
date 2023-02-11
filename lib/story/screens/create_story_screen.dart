import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../backend/api_calls.dart';
import '../states/create_story_state.dart';
import 'loading_content.dart';
import 'question_content.dart';
import 'story_content.dart';

/// Entry point of the story creation.
///
/// Contains the logic that routes between the content (asking questions,
/// loading the story and displaying the story). By "content", we mean the part
/// of the screen which is inserted into the scaffold template.
class CreateStoryScreen extends ConsumerWidget {
  const CreateStoryScreen({Key? key}) : super(key: key);

  Widget _getContent(WidgetRef ref) {
    CreateStoryState state = ref.watch(createStoryStateProvider);
    var story = state.story;
    var storyImage = state.storyImage;

    if (story != null && storyImage != null)
      return StoryContent(
        title: state.storyParams.title,
        story: story,
        storyImage: storyImage,
      );

    if (!state.hasQuestions) {
      // On page load action.
      SchedulerBinding.instance.addPostFrameCallback((_) async {
        String storyText;
        String storyImage;

        try {
          // Parallelization of API calls
          var apiResults = await Future.wait([
            callOpenAiTextGeneration(prompt: state.storyParams.prompt),
            callOpenAiImageGeneration(
                prompt: state.storyParams.imagePrompt)
          ]);

          storyText = apiResults[0];
          storyImage = apiResults[1];
        } catch (e) {
          storyText =
              'Simply say \"Sorry, your story could not be generated. Please try again.\"';
          storyImage = '';
        }

        ref
            .read(createStoryStateProvider.notifier)
            .setStory(storyText, storyImage);
      });

      return LoadingContent();
    }

    return QuestionContent(question: state.currentQuestion);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
        backgroundColor: Theme.of(context).colorScheme.background,
        body: SafeArea(
          child: Container(
            width: MediaQuery.of(context).size.width,
            child: _getContent(ref),
          ),
        ));
  }
}
