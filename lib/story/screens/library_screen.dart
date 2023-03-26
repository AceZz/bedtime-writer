import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../backend/index.dart';
import '../../widgets/app_scaffold.dart';
import '../../widgets/lottie_loading.dart';
import 'story_image.dart';

/// Displays the [title], the [date] and the image of a story in a [ListTile].
///
/// On tap, redirects to `display_story`.
class _StoryTile extends StatelessWidget {
  final String id;
  final String title;
  final DateTime date;

  const _StoryTile({
    Key? key,
    required this.id,
    required this.title,
    required this.date,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final Color tileColor = Theme.of(context).colorScheme.primary;

    return ListTile(
      // Has a preset non-modifiable height
      key: ValueKey(id),
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
            id: id,
            width: 55,
            height: 55,
            fadeColor: tileColor,
          ),
        ),
      ),
      title: Text(title),
      subtitle: Text('Created on ${date.day}/${date.month}/${date.year}'),
      onTap: () {
        context.pushNamed('display_story', params: {'id': id});
      },
    );
  }
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
    List<Widget> children = [];

    children.addAll(
      stories.map(
        (story) => Padding(
          padding: const EdgeInsets.symmetric(vertical: 16.0),
          child: _StoryTile(
            id: story.id,
            title: story.title,
            date: story.date,
          ),
        ),
      ),
    );

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
