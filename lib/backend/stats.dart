import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// User stats.
@immutable
class Stats {
  final int numStories;

  const Stats({required this.numStories});
}

/// Used to interact with a [Stats] object.
abstract class StatsNotifier implements Notifier<Stats> {
}
