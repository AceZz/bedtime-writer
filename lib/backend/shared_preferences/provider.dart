import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../preferences.dart';

/// Provides a reference to the [SharedPreferences] instance.
///
/// This [Provider] must be initialized in main.dart with something like:
///
/// ```
/// final sharedPreferences = await SharedPreferences.getInstance();
/// runApp(
///   ProviderScope(
///     overrides: [
///       sharedPreferencesBaseProvider.overrideWithValue(sharedPreferences)
///     ],
///     child: MyApp(),
///   ),
/// );
/// ```
final sharedPreferencesBaseProvider =
    Provider<SharedPreferences>((ref) => throw UnimplementedError());

/// Implementation of [PreferencesNotifier] for `shared_preferences`.
class SharedPreferencesNotifier extends Notifier<Preferences>
    implements PreferencesNotifier {
  @override
  Preferences build() {
    final sharedPreferences = ref.watch(sharedPreferencesBaseProvider);
    return Preferences(
      ageConfirmed: sharedPreferences.getBool('ageConfirmed') ?? false,
      hasLoggedOut: sharedPreferences.getBool('hasLoggedOut') ?? false,
      accountCreationLastDate:
          sharedPreferences.getString('accountCreationLastDate') ??
              '1900-01-01T00:00:00.000',
      initialFeedbackAsked:
          sharedPreferences.getBool('initialFeedbackAsked') ?? false,
    );
  }

  @override
  Future<void> updateAgeConfirmed(bool newAgeConfirmed) async {
    final sharedPreferences = ref.watch(sharedPreferencesBaseProvider);
    await sharedPreferences.setBool('ageConfirmed', newAgeConfirmed);
    state = state.copyWith(ageConfirmed: newAgeConfirmed);
  }

  @override
  Future<void> updateHasLoggedOut(bool hasLoggedOut) async {
    final sharedPreferences = ref.watch(sharedPreferencesBaseProvider);
    await sharedPreferences.setBool('hasLoggedOut', hasLoggedOut);
    state = state.copyWith(hasLoggedOut: hasLoggedOut);
  }

  @override
  Future<void> updateAccountCreationLastDate() async {
    final creationDate =
        DateTime.now().toIso8601String(); // Stores the date in ISO8601 format
    final sharedPreferences = ref.watch(sharedPreferencesBaseProvider);
    await sharedPreferences.setString('accountCreationLastDate', creationDate);
    state = state.copyWith(lastAccountCreationDate: creationDate);
  }

  @override
  Future<void> updateInitialFeedbackAsked(bool newValue) async {
    final sharedPreferences = ref.watch(sharedPreferencesBaseProvider);
    await sharedPreferences.setBool('initialFeedbackAsked', newValue);
    state = state.copyWith(initialFeedbackAsked: newValue);
  }
}

final sharedPreferencesProvider =
    NotifierProvider<SharedPreferencesNotifier, Preferences>(
  () => SharedPreferencesNotifier(),
);
