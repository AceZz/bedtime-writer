import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;

import '../../widgets/app_scaffold.dart';
import '../backend/api_calls.dart';
import '../backend/firebase.dart';
import '../states/create_story_state.dart';
import 'loading_content.dart';
import 'question_content.dart';
import 'story_image.dart';
import 'story_widget.dart';

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

    if (story != null && storyImage != null) {
      var payload = _SavePayload(
        title: state.storyParams.title,
        story: story,
        storyImage: storyImage,
        prompt: state.storyParams.prompt,
        imagePrompt: state.storyParams.imagePrompt,
      );

      return StoryWidget(
        title: payload.title,
        story: payload.story,
        image: StoryImage(url: payload.storyImage, width: 240, height: 240),
        extra: [Center(child: _SaveButton(payload: payload))],
      );
    }

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
          print(e.toString());
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
    return AppScaffold(child: _getContent(ref));
  }
}

/// Helper class that wraps a save payload.
class _SavePayload {
  final String title;
  final String story;
  final String storyImage;
  final String prompt;
  final String imagePrompt;

  const _SavePayload({
    required this.title,
    required this.story,
    required this.storyImage,
    required this.prompt,
    required this.imagePrompt,
  });
}

/// Saves the story.
class _SaveButton extends StatelessWidget {
  final _SavePayload payload;

  const _SaveButton({Key? key, required this.payload}) : super(key: key);

  Future _onSave(BuildContext context) async {
    return Future.wait([
      // Adds the story to Firestore.
      storiesReference.add({
        'date': Timestamp.now(),
        'title': payload.title,
        'text': payload.story,
        'prompt': payload.prompt,
        'imagePrompt': payload.imagePrompt,
      }),
      // Downloads the image.
      http.get(Uri.parse(payload.storyImage))
    ]).then((results) {
      // Saves the image in Storage.
      var story = results[0] as DocumentReference;
      var image = results[1] as http.Response;
      return storyImageReference(story.id).putData(image.bodyBytes);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Builder(
      builder: (context) => ElevatedButton(
        onPressed: () => _onSave(context),
        child: const Text('Save this story'),
      ),
    );
  }
}
