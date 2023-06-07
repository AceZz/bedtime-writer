import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'story.dart';
import '../concrete.dart';
import '../stats.dart';
import '../user.dart';

/// Provides user stats based on Firebase.

/// Implementation of [StatsProvider] for Firebase.
final firebaseStatsProvider = StreamProvider<Stats>((ref) {
  User user = ref.watch(userProvider);

  if (user is AuthUser) {
    Stream<QuerySnapshot> storiesSnapshots =
        userStoriesQueryBuilder(user).snapshots();
    return storiesSnapshots
        .map((querySnapshot) => Stats(numStories: querySnapshot.docs.length));
  } else {
    return Stream.value(Stats(numStories: 0));
  }
});