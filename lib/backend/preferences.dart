import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// User preferences.
///
/// This serves as an helper to track per device variables.
@immutable
class Preferences {
  final bool ageConfirmed;
  final bool hasLoggedOut;
  final String accountCreationLastDate;

  const Preferences({
    required this.ageConfirmed,
    required this.hasLoggedOut,
    required this.accountCreationLastDate,
  });

  Preferences copyWith({
    bool? ageConfirmed,
    bool? hasLoggedOut,
    String? lastAccountCreationDate,
  }) {
    return Preferences(
      ageConfirmed: ageConfirmed ?? this.ageConfirmed,
      hasLoggedOut: hasLoggedOut ?? this.hasLoggedOut,
      accountCreationLastDate:
          lastAccountCreationDate ?? accountCreationLastDate,
    );
  }
}

/// Used to interact with a [Preferences] object.
abstract class PreferencesNotifier implements Notifier<Preferences> {
  Future<void> updateAgeConfirmed(bool newAgeConfirmed);

  Future<void> updateHasLoggedOut(bool hasLoggedOut);

  Future<void> updateAccountCreationLastDate();
}
