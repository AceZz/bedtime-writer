import 'package:flutter/material.dart';

/// User stories.
@immutable
abstract class UserStory {
  final String uid;
  final String storyId;
  final bool isFavorite;
  final DateTime createdAt;

  const UserStory({
    required this.uid,
    required this.storyId,
    required this.isFavorite,
    required this.createdAt,
  });

  /// Toggle the [isFavorite] state the story.
  ///
  /// Returns the new [isFavorite] state.
  Future<bool> toggleIsFavorite();
}
