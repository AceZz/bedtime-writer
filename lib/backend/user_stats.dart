import 'package:flutter/material.dart';

/// User stats.
@immutable
class UserStats {
  final int numStories;
  final int remainingStories;

  const UserStats({required this.numStories, required this.remainingStories});
}
