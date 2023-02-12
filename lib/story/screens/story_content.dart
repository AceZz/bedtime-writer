import 'package:flutter/material.dart';

import '../../widgets/index.dart';

class StoryContent extends StatelessWidget {
  final String title;
  final String story;
  final String storyImage;

  final double imageWidth = 380;
  final double imageHeight = 380;

  const StoryContent({
    Key? key,
    required this.title,
    required this.story,
    required this.storyImage,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Note: the following widgets will be children of a `ListView`. This means
    // they will take the full width, unless they are surrounded by `Center`.

    Widget titleWidget = Padding(
      padding: EdgeInsetsDirectional.all(20),
      child: Text(
        title,
        textAlign: TextAlign.center,
        style: Theme.of(context).primaryTextTheme.headlineMedium,
      ),
    );

    Widget imageWidget = Padding(
        padding: const EdgeInsets.all(10),
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Wraps the image in a circle
            Container(
              width: imageWidth,
              height: imageHeight,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                image: DecorationImage(
                  image: NetworkImage(storyImage),
                  fit: BoxFit.fill,
                ),
              ),
            ),
            LinearFadeWidget(imageWidth: imageWidth, imageHeight: imageHeight),
            EdgesFadeWidget(imageWidth: imageWidth, imageHeight: imageHeight),
          ],
        ));

    Widget textWidget = Padding(
      padding:
          EdgeInsetsDirectional.only(start: 30, end: 30, top: 15, bottom: 30),
      child: Text(
        story.trim(),
        style: Theme.of(context).primaryTextTheme.bodyMedium,
        textAlign: TextAlign.justify,
      ),
    );

    Widget shareWidget = Center(
      child: ShareButton(
        text: 'Hey! Check out this amazing story I made with '
            'Bedtime stories: \n\n $story',
      ),
    );

    return ListView(
      children: [
        titleWidget,
        imageWidget,
        textWidget,
        shareWidget,
      ],
    );
  }
}

class EdgesFadeWidget extends StatelessWidget {
  const EdgesFadeWidget({
    Key? key,
    required this.imageWidth,
    required this.imageHeight,
  }) : super(key: key);

  final double imageWidth;
  final double imageHeight;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: imageWidth,
      height: imageHeight,
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

class LinearFadeWidget extends StatelessWidget {
  const LinearFadeWidget({
    Key? key,
    required this.imageWidth,
    required this.imageHeight,
  }) : super(key: key);

  final double imageWidth;
  final double imageHeight;

  @override
  Widget build(BuildContext context) {
    return Opacity(
      opacity: 0.4,
      child: Container(
        width: imageWidth,
        height: imageHeight,
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
