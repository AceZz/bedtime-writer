import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';

import '../backend/firebase.dart';
import 'story_image.dart';
import 'story_widget.dart';

class DisplayStoryScreen extends StatelessWidget {
  final String id;

  DisplayStoryScreen({Key? key, required this.id}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
      future: storyReference(id).get(),
      builder: (
        BuildContext context,
        AsyncSnapshot<DocumentSnapshot<Map<String, dynamic>>> snapshot,
      ) {
        final data = snapshot.data;
        Widget content = CircularProgressIndicator();

        if (data != null) {
          content = StoryWidget(
            title: data['title'],
            story: data['text'],
            image: StorageStoryImage(id: id, width: 240, height: 240),
          );
        }

        return Scaffold(
          backgroundColor: Theme.of(context).colorScheme.background,
          body: SafeArea(
            child: Container(
              width: MediaQuery.of(context).size.width,
              child: content,
            ),
          ),
        );
      },
    );
  }
}
