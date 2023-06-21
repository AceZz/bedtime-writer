import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// User preferences.
///
/// [duration] is expressed in minutes.
@immutable
class Preferences {
  static const List<int> allowedDurations = [2, 5];

  final int duration;
  final bool hasLoggedOut;

  const Preferences({required this.duration, required this.hasLoggedOut});

  Preferences copyWith({int? duration, bool? hasLoggedOut}) {
    return Preferences(
        duration: duration ?? this.duration,
        hasLoggedOut: hasLoggedOut ?? this.hasLoggedOut);
  }
}

/// Used to interact with a [Preferences] object.
abstract class PreferencesNotifier implements Notifier<Preferences> {
  Future<void> updateDuration(int newDuration);
  Future<void> updateHasLoggedOut(bool hasLoggedOut);
}
