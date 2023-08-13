import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';

import '../../backend/index.dart';
import '../../config.dart';
import '../../widgets/app_scaffold.dart';
import 'story_image.dart';

/// Displays the [title], the [dateTime] and the image of a [Story] in a
/// [ListTile].
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
      contentPadding: const EdgeInsets.all(8),
      tileColor: tileColor,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
      ),
      leading: SizedBox(
        height: 55,
        width: 55,
        child: Center(
          child: StoryImage(
            image: story.thumbnail,
            width: 55,
            height: 55,
            fadeColor: tileColor,
          ),
        ),
      ),
      title: Text(
        story.title,
        style: Theme.of(context).primaryTextTheme.titleSmall,
      ),
      subtitle: Text('Created on $_formattedDateTime'),
      onTap: () {
        context.pushNamed('display_story', pathParameters: {'id': story.id});
      },
    );
  }

  String get _formattedDateTime =>
      '${story.dateTime.day}/${story.dateTime.month}/${story.dateTime.year}';
}

class LibraryScreen extends StatelessWidget {
  const LibraryScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: AppScaffold(
        appBarTitle: 'Library',
        bottom: _libraryTabBar,
        child: TabBarView(
          children: [
            _LibraryTab(provider: userStoriesProvider),
            _LibraryTab(provider: favoriteUserStoriesProvider),
          ],
        ),
      ),
    );
  }
}

const _libraryTabBar = TabBar(
  tabs: [
    Text('All'),
    Text('Favorites'),
  ],
);

class _LibraryTab extends ConsumerWidget {
  final AutoDisposeStreamProvider<List<Story>> provider;

  const _LibraryTab({
    Key? key,
    required this.provider,
  }) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final storiesStream = ref.watch(provider);

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
            padding: EdgeInsets.symmetric(vertical: 10.sp, horizontal: 15.sp),
            child: _StoryTile(story: story),
          ),
        )
        .toList();

    return ListView(
      children: children,
    );
  }

  Widget _error(error, stackTrace) {
    return Container(
      padding: const EdgeInsets.all(10),
      child: debugStory()
          ? Text('Error: $error')
          : const Text('Something went wrong...'),
    );
  }

  Widget _loading() {
    return Container(
      padding: const EdgeInsets.all(10),
      child: const CircularProgressIndicator(),
    );
  }
}
