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
    return docSnapshots.map(
      (snapshot) => Stats(
        numStories: snapshot['numStories'] ?? 0,
        remainingStories: snapshot['remainingStories'] ?? 0,
      ),
    );
  } else {
    return Stream.value(Stats(numStories: 0, remainingStories: 0));
  }
});

/// A query that only returns stories authored by [user].
DocumentReference<Map<String, dynamic>> _userStatsDocument(AuthUser user) =>
    firebaseFirestore.collection('users').doc(user.uid);
