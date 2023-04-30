import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

import '../stats.dart';
import '../user.dart';
import 'firebase.dart';
import '../concrete.dart';

/// Provides user stats based on Firebase.

/// Implementation of [StatsProvider] for Firebase.
final firebaseStatsProvider = StreamProvider<Stats>((ref) {
  User user = ref.watch(userProvider);

  if (user is AuthUser) {
    Stream<QuerySnapshot> storiesSnapshots =
        _userStoriesQueryBuilder(user).snapshots();
    return storiesSnapshots
        .map((querySnapshot) => Stats(numStories: querySnapshot.docs.length));
  } else {
    return Stream.value(Stats(numStories: 0));
  }
});

/// A query that only returns stories authored by [user].
Query _userStoriesQueryBuilder(AuthUser user) => firebaseFirestore
    .collection('stories')
    .where('author', isEqualTo: user.uid);
