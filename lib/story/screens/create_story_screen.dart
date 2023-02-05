import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../backend/api_calls.dart';
import '../states/state.dart';
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
    StoryState storyState = ref.watch(storyStateProvider);
    var story = storyState.story;
    var storyImage = storyState.storyImage;

    if (story != null && storyImage != null)
      return StoryContent(
        title: storyState.storyParams.title,
        story: story,
        storyImage: storyImage,
      );

    if (!storyState.hasQuestions) {
      // On page load action.
      SchedulerBinding.instance.addPostFrameCallback((_) async {
        String storyText;
        String storyImage;

        // Simpler way to get results from text generation and image API calls
        try {
          storyText = await callOpenAiTextGeneration(
              prompt: storyState.storyParams.prompt);
        } catch (e) {
          storyText =
              'Simply say \"Sorry, your story could not be generated.\"';
        }
        try {
          storyImage = await callOpenAiImageGeneration(
              prompt: storyState.storyParams.imagePrompt);
        } catch (e) {
          storyImage = '';
        }

        ref.read(storyStateProvider.notifier).setStory(storyText, storyImage);
      });

      return LoadingContent();
    }

    return QuestionContent(question: storyState.currentQuestion);
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
