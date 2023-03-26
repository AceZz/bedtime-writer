import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../backend/index.dart';
import '../../widgets/app_scaffold.dart';
import '../../widgets/lottie_loading.dart';
import 'story_image.dart';

/// Displays the [title], the [date] and the image of a [Story] in a [ListTile].
///
/// On tap, redirects to `display_story`.
class _StoryTile extends StatelessWidget {
  final Story story;

  const _StoryTile({
    Key? key,
    required this.story,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final Color tileColor = Theme.of(context).colorScheme.primary;

    return ListTile(
      // Has a preset non-modifiable height
      key: ValueKey(story.id),
      contentPadding: const EdgeInsets.all(8.0),
      tileColor: tileColor,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8.0),
      ),
      leading: SizedBox(
        height: 55,
        width: 55,
        child: Center(
          child: StoryImage(
            story: story,
            width: 55,
            height: 55,
            fadeColor: tileColor,
          ),
        ),
      ),
      title: Text(story.title),
      subtitle: Text('Created on $_formattedDate'),
      onTap: () {
        context.pushNamed('display_story', params: {'id': story.id});
      },
    );
  }

  String get _formattedDate =>
      '${story.date.day}/${story.date.month}/${story.date.year}';
}

class LibraryScreen extends ConsumerWidget {
  LibraryScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final storiesStream = ref.watch(userStoriesProvider);

    return storiesStream.when(
      data: _data,
      error: _error,
      loading: _loading,
    );
  }

  Widget _data(List<Story> stories) {
    final children = stories
        .map(
          (story) => Padding(
            padding: const EdgeInsets.symmetric(vertical: 16.0),
            child: _StoryTile(story: story),
          ),
        )
        .toList();

    return AppScaffold(
      appBarTitle: 'Library',
      child: ListView(
        padding: const EdgeInsets.all(10.0),
        children: children,
      ),
    );
  }

  Widget _error(error, stackTrace) {
    return AppScaffold(
      child: Container(
        padding: const EdgeInsets.all(10.0),
        child: const Text('Something went wrong...'),
      ),
      showAppBar: false,
    );
  }

  Widget _loading() {
    return AppScaffold(
      child: Container(
        padding: const EdgeInsets.all(10.0),
        child: const LottieLoading(),
      ),
      showAppBar: false,
    );
  }
}
