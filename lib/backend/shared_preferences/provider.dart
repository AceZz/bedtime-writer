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
      duration: sharedPreferences.getInt('duration') ?? 2,
    );
  }

  Future<void> updateDuration(int newDuration) async {
    final sharedPreferences = ref.watch(sharedPreferencesBaseProvider);
    await sharedPreferences.setInt('duration', newDuration);
    state = state.copyWith(duration: newDuration);
  }
}

final sharedPreferencesProvider =
    NotifierProvider<SharedPreferencesNotifier, Preferences>(
        () => SharedPreferencesNotifier());