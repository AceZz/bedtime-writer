import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

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

  final TextStyle firstLetterStyle = GoogleFonts.croissantOne(
  fontWeight: FontWeight.bold,
  fontSize: 42,
  );

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
        child: RichText(
          text: TextSpan(
            // Sets a big first letter
            text: story.trim()[0],
            style: firstLetterStyle,
            // Writes the rest of the text
            children: <TextSpan>[
              TextSpan(
                text: story.trim().substring(1),
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
