import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

import '../../backend.dart';

/// Displays the image of the story [id], retrieved from Firebase Storage.
class StorageStoryImage extends StatelessWidget {
  final String id;
  final double width;
  final double height;

  const StorageStoryImage(
      {Key? key, required this.id, required this.width, required this.height})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<String>(
      future: storyImageReference(id).getDownloadURL(),
      builder: (BuildContext context, AsyncSnapshot<String> snapshot) {
        final data = snapshot.data;

        if (data != null) {
          return StoryImage(url: data, width: width, height: height);
        } else if (snapshot.hasError) {
          return Icon(FontAwesomeIcons.triangleExclamation);
        }
        return const CircularProgressIndicator();
      },
    );
  }
}

/// Displays a story image, retrieved from [url].
class StoryImage extends StatelessWidget {
  final String url;
  final double width;
  final double height;

  StoryImage(
      {Key? key, required this.url, required this.width, required this.height})
      : super(key: key);

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
                image: NetworkImage(url),
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
