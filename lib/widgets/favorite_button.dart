import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import '../story/backend/firebase.dart';

/// Saves the story.
class FavoriteButton extends StatelessWidget {
  final SavePayload payload;
  final double iconSize;

  const FavoriteButton({Key? key, required this.payload, required this.iconSize})
      : super(key: key);

  Future _onSave(BuildContext context) async {
    return Future.wait([
      // Adds the story to Firestore.
      storiesReference.add({
        'date': Timestamp.now(),
        'title': payload.title,
        'text': payload.story,
        'prompt': payload.prompt,
        'imagePrompt': payload.imagePrompt,
      }),
      // Downloads the image.
      http.get(Uri.parse(payload.storyImage))
    ]).then((results) {
      // Saves the image in Storage.
      var story = results[0] as DocumentReference;
      var image = results[1] as http.Response;
      return storyImageReference(story.id).putData(image.bodyBytes);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Builder(
      builder: (context) => IconButton(
        iconSize: iconSize,
        onPressed: () => _onSave(context),
        icon: Icon(
          Icons.favorite,
          color: Theme.of(context).textTheme.bodyMedium?.color,
        ),
      ),
    );
  }
}

/// Helper class that wraps a save payload.
class SavePayload {
  final String title;
  final String story;
  final String storyImage;
  final String prompt;
  final String imagePrompt;

  const SavePayload({
    required this.title,
    required this.story,
    required this.storyImage,
    required this.prompt,
    required this.imagePrompt,
  });
}