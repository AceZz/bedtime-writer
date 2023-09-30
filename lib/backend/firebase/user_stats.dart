import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../utils.dart';
import '../concrete.dart';
import '../user.dart';
import '../user_stats.dart';
import 'firebase.dart';

/// Provides user stats based on Firebase.

/// Implementation of [StatsProvider] for Firebase.
final firebaseUserStatsProvider = StreamProvider<UserStats>((ref) {
  User user = ref.watch(userProvider);

  if (user is AuthUser) {
    Stream<DocumentSnapshot> docSnapshots =
        _userStatsDocument(user).snapshots();
    return docSnapshots.map((snapshot) {
      final int numStories = snapshot['numStories'] ?? 0;
      int remainingStories = snapshot['remainingStories'] ?? 0;

      //For anonymous users, having logged out imposes 0 remaining stories
      if (user is AnonymousUser && ref.read(preferencesProvider).hasLoggedOut) {
        remainingStories = 0;
      }

      return UserStats(
        numStories: numStories,
        remainingStories: remainingStories,
      );
    });
  } else {
    return Stream.value(const UserStats(numStories: 0, remainingStories: 0));
  }
});

/// A query that returns user stats for [user].
DocumentReference<DynMap> _userStatsDocument(AuthUser user) =>
    firebaseFirestore.collection(userStats).doc(user.uid);
