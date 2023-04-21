import 'dart:typed_data';

/// Represents a part of a generated story.
abstract class StoryPart {
  const StoryPart();

  bool get hasImage;

  Future<Uint8List> get image;

  String get text;
}
