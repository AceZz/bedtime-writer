import 'package:flutter/material.dart';

import '../../widgets/index.dart';

class StoryContent extends StatelessWidget {
  final String title;
  final String story;
  final String storyImage;

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
      padding: const EdgeInsets.all(15),
      child: Center(
        child: ClipRRect(
          borderRadius: BorderRadius.circular(15),
          child: Image.network(
            storyImage,
            width: 240,
            height: 240,
            fit: BoxFit.cover,
          ),
        ),
      ),
    );

    Widget textWidget = Padding(
      padding: EdgeInsetsDirectional.all(30),
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
