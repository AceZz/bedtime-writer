import 'dart:typed_data';

import 'story_part.dart';

/// Represents a generated story.
abstract class Story {
  const Story();

  String get id;

  String get title;

  String get author;

  DateTime get dateTime;

  bool get isFavorite;

  /// Toggle the [isFavorite] state the story.
  ///
  /// Returns the new [isFavorite] state.
  Future<bool> toggleIsFavorite();

  int get numParts;

  Future<StoryPart> getPart(int index);

  Future<Uint8List?> get thumbnail;
}
