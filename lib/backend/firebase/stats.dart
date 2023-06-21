import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'firebase.dart';
import '../concrete.dart';
import '../stats.dart';
import '../user.dart';

/// Provides user stats based on Firebase.

/// Implementation of [StatsProvider] for Firebase.
final firebaseStatsProvider = StreamProvider<Stats>((ref) {
  User user = ref.watch(userProvider);

  if (user is AuthUser) {
    Stream<DocumentSnapshot> docSnapshots =
        _userStatsDocument(user).snapshots();
    return docSnapshots.map((snapshot) {
      final int snapshotNumStories = snapshot['numStories'] ?? 0;
      int snapshotRemainingStories = snapshot['remainingStories'] ?? 0;
      //For anonymous users, having logged out imposes 0 remaining stories
      if (user is AnonymousUser) {
        if (ref.read(preferencesProvider).hasLoggedOut) {
          snapshotRemainingStories = 0;
        }
      }

      return Stats(
        numStories: snapshotNumStories,
        remainingStories: snapshotRemainingStories,
      );
    });
  } else {
    return Stream.value(Stats(numStories: 0, remainingStories: 0));
  }
});

/// A query that only returns stories authored by [user].
DocumentReference<Map<String, dynamic>> _userStatsDocument(AuthUser user) =>
    firebaseFirestore.collection('users').doc(user.uid);
