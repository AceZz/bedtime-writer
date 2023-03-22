import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

import '../../backend.dart';
import '../../widgets/cloud_storage_image.dart';

/// Displays the image of the story [id].
///
/// The image is retrieved from Cloud Storage if it exists, otherwise from the
/// providerUrl.
class StoryImage extends StatelessWidget {
  final String id;
  final double width;
  final double height;

  const StoryImage({
    Key? key,
    required this.id,
    required this.width,
    required this.height,
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

  StoryImageDecoration({
    Key? key,
    required this.image,
    required this.width,
    required this.height,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.center,
      children: [
        // Wraps the image in a circle
        Container(
          width: width,
          height: height,
          decoration: BoxDecoration(
              shape: BoxShape.circle,
              image: DecorationImage(
                image: image,
                fit: BoxFit.fill,
              )),
        ),
        _LinearFadeWidget(width: width, height: height),
        _EdgesFadeWidget(width: width, height: height),
      ],
    );
  }
}

class _LinearFadeWidget extends StatelessWidget {
  const _LinearFadeWidget({
    Key? key,
    required this.width,
    required this.height,
  }) : super(key: key);

  final double width;
  final double height;

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
              Theme.of(context).colorScheme.background
            ],
          ),
          shape: BoxShape.circle,
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
  }) : super(key: key);

  final double width;
  final double height;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        gradient: RadialGradient(
          stops: [0, 0.9, 1],
          colors: [
            Colors.transparent,
            Colors.transparent,
            Theme.of(context).colorScheme.background
          ],
        ),
        shape: BoxShape.circle,
      ),
    );
  }
}
