import 'dart:math';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'story_image.dart';

/// Displays a story: [title], [image], [story] and a Share button.
///
/// [image] will likely be a [StoryImageDecoration] or a [CloudStorageStoryImage].
class StoryWidget extends StatelessWidget {
  final String title;
  final String story;
  final Widget image;

  StoryWidget({
    Key? key,
    required this.title,
    required this.story,
    required this.image,
  }) : super(key: key);

  // Removes "The End." within story if present to avoid duplicate
  String removeTheEnd(String text) {
    String trimmedText = text.trim();
    final endsToRemove = [
      'the end.',
      'the end!',
      'the end...',
      'the end',
    ];

    for (var end in endsToRemove) {
      if (trimmedText
          .substring(max(0, trimmedText.length - end.length))
          .toLowerCase()
          .endsWith(end)) {
        return trimmedText.substring(0, trimmedText.length - end.length - 1);
      }
    }
    return trimmedText;
  }

  @override
  Widget build(BuildContext context) {
    // Note: the following widgets will be children of a `ListView`. This means
    // they will take the full width, unless they are surrounded by `Center`.

    // Define additional styles here as they need context
    final TextStyle _storyTitleStyle =
        GoogleFonts.amaticSc(fontWeight: FontWeight.bold, fontSize: 52);
    final TextStyle _firstLetterStyle = GoogleFonts.croissantOne(
      fontWeight: FontWeight.bold,
      fontSize: 42,
      color: Theme.of(context).primaryTextTheme.bodyMedium?.color,
    );
    final TextStyle _theEndStyle = GoogleFonts.amaticSc(
      fontWeight: FontWeight.bold,
      fontSize: 46,
    );

    Widget titleWidget = Padding(
      padding: const EdgeInsets.all(20),
      child: Text(
        title,
        textAlign: TextAlign.center,
        style: _storyTitleStyle,
      ),
    );

    Widget imageWidget =
        Padding(padding: const EdgeInsets.all(10), child: image);

    Widget textWidget = Padding(
        padding:
            const EdgeInsets.only(left: 30, right: 30, top: 30, bottom: 10),
        child: RichText(
          text: TextSpan(
            // Sets a big first letter
            text: story.trim()[0],
            style: _firstLetterStyle,
            // Writes the rest of the text
            children: <TextSpan>[
              TextSpan(
                text: removeTheEnd(story).substring(1),
                style: Theme.of(context).primaryTextTheme.bodyMedium,
              ),
            ],
          ),
          strutStyle: (StrutStyle(
            fontSize: Theme.of(context).primaryTextTheme.bodyMedium?.fontSize,
            height: Theme.of(context).primaryTextTheme.bodyMedium?.height,
            forceStrutHeight: true,
          )),
          textAlign: TextAlign.justify,
        ));

    Widget theEndWidget = Padding(
      padding: const EdgeInsets.all(5),
      child: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: 10,
        ),
        child:
            Text('The End', textAlign: TextAlign.center, style: _theEndStyle),
      ),
    );

    List<Widget> bottomWidgets = [
      theEndWidget,
    ];

    Widget iconsRow = Padding(
      padding: const EdgeInsets.only(
        top: 10,
        bottom: 50,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: bottomWidgets,
      ),
    );

    return ListView(
      children: [
        titleWidget,
        imageWidget,
        textWidget,
        iconsRow,
      ],
    );
  }
}
