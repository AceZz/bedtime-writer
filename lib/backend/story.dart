import 'dart:typed_data';

/// Represents a generated story.
abstract class Story {
  const Story();

  String get id;

  String get title;

  String get author;

  DateTime get dateTime;

  Future<Uint8List> get image;

  String get text;

  bool get isFavorite;

  /// Toggle the [isFavorite] state the story.
  ///
  /// Returns the new [isFavorite] state.
  Future<bool> toggleIsFavorite();
}
