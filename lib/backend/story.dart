import 'dart:typed_data';

/// Represents a generated story.
abstract class Story {
  const Story();

  String get id;

  String get title;

  String get author;

  DateTime get date;

  Future<Uint8List> get image;

  String get text;
}
