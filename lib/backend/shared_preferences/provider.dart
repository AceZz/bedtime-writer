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
      duration: sharedPreferences.getInt('duration') ?? 2,
      hasLoggedOut: sharedPreferences.getBool('hasLoggedOut') ?? false,
    );
  }

  Future<void> updateAgeConfirmed(bool newAgeConfirmed) async {
    final sharedPreferences = ref.watch(sharedPreferencesBaseProvider);
    await sharedPreferences.setBool('ageConfirmed', newAgeConfirmed);
    state = state.copyWith(ageConfirmed: newAgeConfirmed);
  }

  Future<void> updateDuration(int newDuration) async {
    final sharedPreferences = ref.watch(sharedPreferencesBaseProvider);
    await sharedPreferences.setInt('duration', newDuration);
    state = state.copyWith(duration: newDuration);
  }

  Future<void> updateHasLoggedOut(bool hasLoggedOut) async {
    final sharedPreferences = ref.watch(sharedPreferencesBaseProvider);
    await sharedPreferences.setBool('hasLoggedOut', hasLoggedOut);
    state = state.copyWith(hasLoggedOut: hasLoggedOut);
  }
}

final sharedPreferencesProvider =
    NotifierProvider<SharedPreferencesNotifier, Preferences>(
        () => SharedPreferencesNotifier());
