import 'package:flutter/material.dart';

import '../../widgets/index.dart';
import 'story_image.dart';

/// Displays a story: [title], [image], [story] and a Share button.
///
/// [image] will likely be a [StoryImage] or a [StorageStoryImage].
class StoryWidget extends StatelessWidget {
  final String title;
  final String story;
  final Widget image;
  late final List<Widget> extra;

  StoryWidget({
    Key? key,
    required this.title,
    required this.story,
    required this.image,
    List<Widget>? extra,
  }) : super(key: key) {
    this.extra = extra ?? [];
  }

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

    Widget imageWidget =
        Padding(padding: const EdgeInsets.all(10), child: image);

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
        ...extra,
      ],
    );
  }
}
