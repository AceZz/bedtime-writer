import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

import '../../backend/index.dart';
import '../../widgets/cloud_storage_image.dart';

/// Displays the image of the story [id].
///
/// The image is retrieved from Cloud Storage if it exists, otherwise from the
/// providerUrl.
class StoryImage extends StatelessWidget {
  final String id;
  final double width;
  final double height;
  final Color fadeColor;

  const StoryImage({
    Key? key,
    required this.id,
    required this.width,
    required this.height,
    required this.fadeColor,
  }) : super(key: key);

  Future<DocumentSnapshot<Map<String, dynamic>>> get story =>
      storyReference(id).get();

  Future<ImageProvider> get storyImage => story.then((story) async {
        final data = story.data();
        if (data == null) throw FormatException('No data for story $id.');
        if (!data.containsKey('image'))
          throw FormatException('Story $id has no image.');

        final imageData = data['image'] as Map<String, dynamic>;
        if (imageData.containsKey('cloudStoragePath'))
          return await getCloudStorageImage(story['image']['cloudStoragePath']);
        else if (imageData.containsKey('providerUrl'))
          return Image.network(imageData['providerUrl']).image;
        throw FormatException('Story $id has no image.');
      });

  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
      future: storyImage,
      builder: (
        BuildContext context,
        AsyncSnapshot<ImageProvider> snapshot,
      ) {
        final image = snapshot.data;
        if (image != null) {
          return StoryImageDecoration(
            image: image,
            width: width,
            height: height,
            fadeColor: fadeColor,
          );
        } else if (snapshot.hasError) {
          return Icon(FontAwesomeIcons.triangleExclamation);
        }
        return const CircularProgressIndicator();
      },
    );
  }
}

/// Displays an image as the image of a story.
class StoryImageDecoration extends StatelessWidget {
  final ImageProvider image;
  final double width;
  final double height;
  final Color fadeColor;

  StoryImageDecoration({
    Key? key,
    required this.image,
    required this.width,
    required this.height,
    required this.fadeColor,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.center,
      children: [
        // Wraps the image in a rectangle with rounded corners
        ClipRRect(
          borderRadius: BorderRadius.circular(20),
          child: Container(
            width: width,
            height: height,
            decoration: BoxDecoration(
                shape: BoxShape.rectangle,
                image: DecorationImage(
                  image: image,
                  fit: BoxFit.fill,
                )),
          ),
        ),
        _LinearFadeWidget(
          width: width,
          height: height,
          fadeColor: fadeColor,
        ),
        _EdgesFadeWidget(
          width: width,
          height: height,
          fadeColor: fadeColor,
        ),
      ],
    );
  }
}

class _LinearFadeWidget extends StatelessWidget {
  const _LinearFadeWidget({
    Key? key,
    required this.width,
    required this.height,
    required this.fadeColor,
  }) : super(key: key);

  final double width;
  final double height;
  final Color fadeColor;

  @override
  Widget build(BuildContext context) {
    return Opacity(
      opacity: 0.4,
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Colors.transparent,
              fadeColor,
            ],
          ),
          shape: BoxShape.rectangle,
        ),
      ),
    );
  }
}

class _EdgesFadeWidget extends StatelessWidget {
  const _EdgesFadeWidget({
    Key? key,
    required this.width,
    required this.height,
    required this.fadeColor,
  }) : super(key: key);

  final double width;
  final double height;
  final Color fadeColor;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(20),
      child: Stack(
        children: [
          Container(
            width: width,
            height: height,
            color: Colors.transparent,
          ),
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topRight,
                  end: Alignment.bottomLeft,
                  stops: [0, 0.15, 0.85, 1],
                  colors: [
                    fadeColor,
                    Colors.transparent,
                    Colors.transparent,
                    fadeColor,
                  ],
                ),
              ),
            ),
          ),
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  stops: [0, 0.15, 0.85, 1],
                  colors: [
                    fadeColor,
                    Colors.transparent,
                    Colors.transparent,
                    fadeColor,
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
