import 'package:flutter/material.dart';

/// User stats.
@immutable
class Stats {
  final int numStories;
  final int remainingStories;

  const Stats({required this.numStories, required this.remainingStories});
}
