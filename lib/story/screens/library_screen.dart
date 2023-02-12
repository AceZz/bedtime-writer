import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../widgets/app_scaffold.dart';
import '../backend/firebase.dart';
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
      key: ValueKey(id),
      contentPadding: EdgeInsetsDirectional.all(8.0),
      tileColor: Theme.of(context).colorScheme.primary,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8.0),
      ),
      leading: SizedBox(
        width: 80,
        height: 80,
        child: Center(
          child: StorageStoryImage(id: id, width: 80, height: 80),
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

class LibraryScreen extends StatelessWidget {
  LibraryScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final titleWidget = Text(
      'Library',
      textAlign: TextAlign.center,
      style: Theme.of(context).primaryTextTheme.headlineMedium,
    );

    final lottieWidget = LottieLoading();

    return FutureBuilder(
      future: storiesReference.get(),
      builder: (
        BuildContext context,
        AsyncSnapshot<QuerySnapshot<Map<String, dynamic>>> snapshot,
      ) {
        List<Widget> children = [titleWidget];
        final data = snapshot.data;

        if (data != null) {
          children.addAll(
            data.docs.map(
              (doc) => Padding(
                padding: EdgeInsets.symmetric(vertical: 16.0),
                child: _StoryTile(
                  id: doc.id,
                  title: doc['title'],
                  creationDate: doc['date'],
                ),
              ),
            ),
          );
        } else {
          children.add(lottieWidget);
        }

        return AppScaffold(
          child: ListView(
            padding: const EdgeInsets.all(10.0),
            children: children,
          ),
        );
      },
    );
  }
}
