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
    return _Scaffold(
      story: story,
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
    return _Scaffold(child: const Text('Something went wrong...'));
  }

  Widget _loading() => _Scaffold(child: const CircularProgressIndicator());
}

class _Scaffold extends StatelessWidget {
  final Story? story;
  final Widget child;

  const _Scaffold({Key? key, required this.child, this.story})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    final _story = story;
    List<Widget> actions = [];

    if (_story != null) {
      actions.add(
        ShareButton(
          iconSize: 30,
          text: 'Hey! Check out this amazing story I made with '
              'Bedtime stories: \n\n ${_story.text}',
        ),
      );
      actions.add(
        FavoriteButton(
          isFavorite: _story.isFavorite,
          iconSize: 30,
          onPressed: () async {
            final isFavorite = await _story.toggleIsFavorite();
            ScaffoldMessenger.of(context).showSnackBar(
              _favoriteSnackBar(context, isFavorite),
            );
          },
        ),
      );
    }

    return AppScaffold(
      appBarTitle: 'Story',
      scrollableAppBar: true,
      actions: actions,
      child: child,
    );
  }
}

SnackBar _favoriteSnackBar(BuildContext context, bool isFavorite) {
  final text =
      isFavorite ? "Story added to favorites" : "Story removed from favorites";

  return SnackBar(
    content: Center(
      child: Text(text, style: Theme.of(context).textTheme.bodyMedium),
    ),
    backgroundColor: Theme.of(context).colorScheme.primary,
    behavior: SnackBarBehavior.floating,
    duration: Duration(seconds: 3),
  );
}
