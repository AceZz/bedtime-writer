import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// User preferences.
///
/// [duration] is expressed in minutes.
@immutable
class Preferences {
  static const List<int> allowedDurations = [2, 5];

  final int duration;

  const Preferences({required this.duration});

  Preferences copyWith({int? duration}) {
    return Preferences(duration: duration ?? this.duration);
  }
}

/// Used to interact with a [Preferences] object.
abstract class PreferencesNotifier implements Notifier<Preferences> {
  Future<void> updateDuration(int newDuration);
}
