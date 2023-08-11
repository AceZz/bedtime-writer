import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// User preferences.
///
/// [duration] is expressed in minutes.
@immutable
class Preferences {
  static const List<int> allowedDurations = [2, 5];

  final bool ageConfirmed;
  final int duration;
  final bool hasLoggedOut;
  final String accountCreationLastDate;

  const Preferences({
    required this.ageConfirmed,
    required this.duration,
    required this.hasLoggedOut,
    required this.accountCreationLastDate,
  });

  Preferences copyWith({
    bool? ageConfirmed,
    int? duration,
    bool? hasLoggedOut,
    String? lastAccountCreationDate,
  }) {
    return Preferences(
      ageConfirmed: ageConfirmed ?? this.ageConfirmed,
      duration: duration ?? this.duration,
      hasLoggedOut: hasLoggedOut ?? this.hasLoggedOut,
      accountCreationLastDate:
          lastAccountCreationDate ?? this.accountCreationLastDate,
    );
  }
}

/// Used to interact with a [Preferences] object.
abstract class PreferencesNotifier implements Notifier<Preferences> {
  Future<void> updateAgeConfirmed(bool newAgeConfirmed);

  Future<void> updateDuration(int newDuration);

  Future<void> updateHasLoggedOut(bool hasLoggedOut);

  Future<void> updateAccountCreationLastDate();
}
