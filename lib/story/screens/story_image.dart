import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

/// Displays the [image] of a story.
class StoryImage extends StatelessWidget {
  final Future<Uint8List?> image;
  final double width;
  final double height;
  final Color fadeColor;

  const StoryImage({
    Key? key,
    required this.image,
    required this.width,
    required this.height,
    required this.fadeColor,
  }) : super(key: key);

  Future<ImageProvider> get storyImage async {
    final bytes = await image;
    return Image.memory(bytes!).image;
  }

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
