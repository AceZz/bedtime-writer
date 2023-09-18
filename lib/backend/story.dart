import 'dart:typed_data';

import 'story_status.dart';

/// Represents a generated story.
abstract class Story {
  const Story();

  String get id;

  String get title;

  String get author;

  DateTime get dateTime;

  StoryStatus get status;

  bool get isFavorite;

  //TODO: delete below
  /// Toggle the [isFavorite] state the story.
  ///
  /// Returns the new [isFavorite] state.
  Future<bool> toggleIsFavorite();

  int get numParts;

  /// Returns the ID of the part at [index].
  String getPartId(int index);

  Future<Uint8List?> get thumbnail;
}
