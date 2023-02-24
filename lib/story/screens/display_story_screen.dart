import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';

import '../../widgets/app_scaffold.dart';
import '../backend/firebase.dart';
import 'story_image.dart';
import 'story_widget.dart';

class DisplayStoryScreen extends StatelessWidget {
  final String id;

  const DisplayStoryScreen({Key? key, required this.id}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
      future: storyReference(id).get(),
      builder: (
        BuildContext context,
        AsyncSnapshot<DocumentSnapshot<Map<String, dynamic>>> snapshot,
      ) {
        final data = snapshot.data;
        Widget content = const CircularProgressIndicator();

        if (data != null) {
          content = StoryWidget(
            title: data['title'],
            story: data['text'],
            image: StorageStoryImage(id: id, width: 380, height: 380),
          );
        }

        return AppScaffold(
          appBarTitle: 'Story',
          child: content,
        );
      },
    );
  }
}
