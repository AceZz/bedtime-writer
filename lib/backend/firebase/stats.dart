import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

import '../stats.dart';
import '../user.dart';
import 'firebase.dart';
import '../concrete.dart';

/// Provides user stats based on Firebase.
///
/// TODO: maybe change below
/// This [Provider] must be initialized in main.dart with something like:
///
/// ```
/// TODO: change below
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

/// Implementation of [StatsProvider] for Firebase.
final firebaseStatsProvider = FutureProvider<Stats>((ref) async {
  User user = ref.watch(userProvider);

  if (user is AuthUser) {
    AggregateQuerySnapshot numStoriesSnapshot =
        await _userNumStoriesQueryBuilder(user).get();
    int numStories = numStoriesSnapshot.count;
    return Stats(numStories: numStories);
  } else {
    return Stats(numStories: 0);
  }
});

/// A query that only returns stories authored by [user].
AggregateQuery _userNumStoriesQueryBuilder(AuthUser user) => firebaseFirestore
    .collection('stories')
    .where('author', isEqualTo: user.uid)
    .count();
