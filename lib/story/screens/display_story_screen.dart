import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:tuple/tuple.dart';

import '../../backend/concrete.dart';
import '../../backend/index.dart';
import '../../widgets/app_scaffold.dart';
import '../../widgets/share_button.dart';
import 'favorite_button.dart';
import 'story_image.dart';

/// Overridable Local Provider (OLP) holding the current story ID.
/// Reminder: the point of using OLPs is to create the [_StoryPartWidget] as
/// `const`.
final _currentStoryId = Provider<String>((ref) => throw UnimplementedError());

/// OLP holding the current part index when building the list in [_StoryParts].
final _currentPartIndex = Provider<int>((ref) => throw UnimplementedError());

class DisplayStoryScreen extends ConsumerWidget {
  final String id;

  const DisplayStoryScreen({Key? key, required this.id}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final status = ref.watch(storyStatusProvider(id)).value;

    return ProviderScope(
      overrides: [_currentStoryId.overrideWithValue(id)],
      child: AppScaffold(
        appBarTitle: 'Story',
        scrollableAppBar: true,
        actions: [
          if (status == StoryStatus.complete) const _ShareButton(),
          const _FavoriteButton(),
        ],
        child: const _StoryWidget(),
      ),
    );
  }
}

class _ShareButton extends ConsumerWidget {
  const _ShareButton({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ShareButton(
      iconSize: 30.sp,
      text: 'Hey! Check out this amazing story I made with Bedtime stories',
    );
  }
}

class _FavoriteButton extends ConsumerWidget {
  const _FavoriteButton({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final storyId = ref.watch(_currentStoryId);
    final isFavorite = ref.watch(
      storyProvider(storyId)
          .select((story) => story.valueOrNull?.isFavorite ?? false),
    );

    return FavoriteButton(
      isFavorite: isFavorite,
      iconSize: 30.sp,
      onPressed: () async {
        final story = ref.read(storyProvider(storyId)).value;

        if (story != null) {
          final isFavorite = await story.toggleIsFavorite();
          ScaffoldMessenger.of(context).showSnackBar(
            _favoriteSnackBar(context, isFavorite),
          );
        }
      },
    );
  }
}

/// Displays the title of the story as well as its parts.
class _StoryWidget extends ConsumerWidget {
  const _StoryWidget({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Column(
      children: [
        SizedBox(height: 20.sp),
        const _StoryTitle(),
        SizedBox(height: 20.sp),
        const _StoryParts(),
        const _BottomRow(),
      ],
    );
  }
}

class _StoryTitle extends ConsumerWidget {
  const _StoryTitle({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final storyId = ref.watch(_currentStoryId);
    final title = ref.watch(
      storyProvider(storyId).select((story) => story.valueOrNull?.title ?? ''),
    );

    final _storyTitleStyle =
        GoogleFonts.amaticSc(fontWeight: FontWeight.bold, fontSize: 52.sp);

    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 20.sp),
      child: Text(
        title,
        textAlign: TextAlign.center,
        style: _storyTitleStyle,
      ),
    );
  }
}

class _StoryParts extends ConsumerWidget {
  const _StoryParts({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final storyId = ref.watch(_currentStoryId);
    final numParts = ref.watch(
      storyProvider(storyId)
          .select((story) => story.valueOrNull?.numParts ?? 0),
    );

    return Column(
      children: [
        for (int partIndex = 0; partIndex < numParts; partIndex++) ...[
          ProviderScope(
            overrides: [
              _currentPartIndex.overrideWithValue(partIndex),
            ],
            child: const _StoryPartWidget(),
          ),
          SizedBox(height: 20.sp),
        ]
      ],
    );
  }
}

/// Displays a story part: image and text.
class _StoryPartWidget extends ConsumerWidget {
  const _StoryPartWidget({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final storyId = ref.watch(_currentStoryId);
    final partIndex = ref.watch(_currentPartIndex);
    final partId = ref.watch(
      storyProvider(storyId).select(
        (story) => story.valueOrNull?.getPartId(partIndex),
      ),
    );

    if (partId == null) {
      return const CircularProgressIndicator();
    }

    final part = ref.watch(storyPartProvider(Tuple2(storyId, partId)));

    return part.when(
      data: (part) => Column(
        children: [
          if (part.hasImage) ...[
            StoryImage(
              image: part.image,
              width: 360.sp,
              height: 360.sp,
              fadeColor: Theme.of(context).colorScheme.background,
            ),
            SizedBox(height: 30.sp),
          ],
          _textWidget(context, part.text, withBigFirstLetter: partIndex == 0),
        ],
      ),
      loading: () => const CircularProgressIndicator(),
      error: (error, stackTrace) => const Text('Something went wrong...'),
    );
  }

  Widget _textWidget(BuildContext context, String text,
      {required bool withBigFirstLetter}) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 30.sp),
      child: RichText(
        text: withBigFirstLetter
            ? _textWithBigFirstLetter(context, text)
            : TextSpan(
                text: _removeTheEnd(text),
                style: Theme.of(context).primaryTextTheme.bodyMedium,
              ),
        strutStyle: StrutStyle(
          fontSize: Theme.of(context).primaryTextTheme.bodyMedium?.fontSize,
          height: Theme.of(context).primaryTextTheme.bodyMedium?.height,
          forceStrutHeight: true,
        ),
        textAlign: TextAlign.justify,
      ),
    );
  }

  TextSpan _textWithBigFirstLetter(BuildContext context, String text) {
    final TextStyle _firstLetterStyle = GoogleFonts.croissantOne(
      fontWeight: FontWeight.bold,
      fontSize: 42.sp,
      color: Theme.of(context).primaryTextTheme.bodyMedium?.color,
    );

    return TextSpan(
      // Sets a big first letter
      text: text.trim()[0],
      style: _firstLetterStyle,
      // Writes the rest of the text
      children: <TextSpan>[
        TextSpan(
          text: _removeTheEnd(text).substring(1),
          style: Theme.of(context).primaryTextTheme.bodyMedium,
        ),
      ],
    );
  }

  /// Removes "The End." at the end of the text.
  String _removeTheEnd(String text) {
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
}

class _BottomRow extends ConsumerWidget {
  const _BottomRow({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final storyId = ref.watch(_currentStoryId);
    final status = ref.watch(storyStatusProvider(storyId)).value;

    final _theEndStyle = GoogleFonts.amaticSc(
      fontWeight: FontWeight.bold,
      fontSize: 46.sp,
    );

    final theEndWidget = Padding(
      padding: EdgeInsets.symmetric(horizontal: 10.sp),
      child: Text('The End', textAlign: TextAlign.center, style: _theEndStyle),
    );

    return Padding(
      padding: const EdgeInsets.only(
        top: 10,
        bottom: 50,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          if (status == StoryStatus.complete)
            theEndWidget
          else
            const CircularProgressIndicator()
        ],
      ),
    );
  }
}

SnackBar _favoriteSnackBar(BuildContext context, bool isFavorite) {
  final text =
      isFavorite ? "Story added to favorites" : "Story removed from favorites";

  return SnackBar(
    content: Center(
      child: Text(text, style: Theme.of(context).textTheme.bodyMedium),
    ),
    backgroundColor: Theme.of(context).colorScheme.primary,
    behavior: SnackBarBehavior.floating,
    duration: Duration(seconds: 3),
  );
}
