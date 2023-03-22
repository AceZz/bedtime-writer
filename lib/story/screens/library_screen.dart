import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../backend.dart';
import '../../widgets/app_scaffold.dart';
import '../../widgets/lottie_loading.dart';
import 'story_image.dart';

/// Displays the [title], the [creationDate] and the image of a story in a
/// [ListTile].
///
/// On tap, redirects to `display_story`.
class _StoryTile extends StatelessWidget {
  final String id;
  final String title;
  final Timestamp creationDate;

  const _StoryTile({
    Key? key,
    required this.id,
    required this.title,
    required this.creationDate,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    DateTime date = creationDate.toDate();

    return ListTile(
      // Has a preset non-modifiable height
      key: ValueKey(id),
      contentPadding: const EdgeInsets.all(8.0),
      tileColor: Theme.of(context).colorScheme.primary,
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
            forLibrary: true,
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
    final user = ref.watch(userProvider);
    final query = storiesReference.where('author', isEqualTo: user.value?.uid);
    final lottieWidget = LottieLoading();

    return FutureBuilder(
      future: query.get(),
      builder: (
        BuildContext context,
        AsyncSnapshot<QuerySnapshot<Map<String, dynamic>>> snapshot,
      ) {
        List<Widget> children = [];
        final data = snapshot.data;

        if (data != null) {
          children.addAll(
            data.docs.map(
              (doc) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 16.0),
                child: _StoryTile(
                  id: doc.id,
                  title: doc['title'],
                  creationDate: doc['date'],
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
        } else {
          children.add(lottieWidget);
          return AppScaffold(
            child: ListView(
              padding: const EdgeInsets.all(10.0),
              children: children,
            ),
            showAppBar: false,
          );
        }
      },
    );
  }
}
