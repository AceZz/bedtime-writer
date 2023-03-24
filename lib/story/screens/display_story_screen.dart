import 'package:bedtime_writer/story/screens/favorite_button.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';

import '../../backend.dart';
import '../../widgets/app_scaffold.dart';
import '../../widgets/share_button.dart';
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
            image: StoryImage(
              id: id,
              width: 360,
              height: 360,
              fadeColor: Theme.of(context).colorScheme.background,
            ),
          );
        }

        String story = data?['text'] ?? '';
        Widget shareButton = ShareButton(
          iconSize: 30,
          text: 'Hey! Check out this amazing story I made with '
              'Bedtime stories: \n\n $story',
        );
        Widget favoriteButton = FavoriteButton(iconSize: 30);

        return AppScaffold(
          appBarTitle: 'Story',
          scrollableAppBar: true,
          actions: [shareButton, favoriteButton],
          child: content,
        );
      },
    );
  }
}
