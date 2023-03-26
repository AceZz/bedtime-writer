import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../backend/index.dart';
import '../../widgets/app_scaffold.dart';
import '../../widgets/share_button.dart';
import 'favorite_button.dart';
import 'story_image.dart';
import 'story_widget.dart';

class DisplayStoryScreen extends ConsumerWidget {
  final String id;

  const DisplayStoryScreen({Key? key, required this.id}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final story = ref.watch(storyProvider(id));
    return story.when(
      data: (Story story) => _data(context, story),
      error: _error,
      loading: _loading,
    );
  }

  Widget _data(BuildContext context, Story story) {
    return _scaffold(
      shareText: story.text,
      child: StoryWidget(
        title: story.title,
        story: story.text,
        image: StoryImage(
          story: story,
          width: 360,
          height: 360,
          fadeColor: Theme.of(context).colorScheme.background,
        ),
      ),
    );
  }

  Widget _error(error, stackTrace) {
    return _scaffold(child: const Text('Something went wrong...'));
  }

  Widget _loading() => _scaffold(child: const CircularProgressIndicator());

  Widget _scaffold({required Widget child, String? shareText}) {
    Widget shareButton = ShareButton(
      iconSize: 30,
      text: 'Hey! Check out this amazing story I made with '
          'Bedtime stories: \n\n $shareText',
    );
    Widget favoriteButton = FavoriteButton(iconSize: 30);

    return AppScaffold(
      appBarTitle: 'Story',
      scrollableAppBar: true,
      actions: [shareButton, favoriteButton],
      child: child,
    );
  }
}
