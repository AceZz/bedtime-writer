import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

import '../index.dart';
import 'firebase.dart';

/// Streams a specific [UserStory].
final firebaseUserStoryProvider =
    StreamProvider.autoDispose.family<UserStory, String>((ref, storyId) {
  final uid = ref.read(userProvider).toString();
  final snapshots = firebaseFirestore
      .collection(userStories)
      .doc(uid)
      .collection(userStoriesSubCache)
      .doc(storyId)
      .snapshots();
  return snapshots.map((story) => _FirebaseUserStory.deserialize(uid, story));
});

/// Firebase implementation of [UserStory].
class _FirebaseUserStory implements UserStory {
  @override
  final String uid;
  @override
  final String storyId;
  final Map<String, dynamic> _data;

  factory _FirebaseUserStory.deserialize(
    String uid,
    DocumentSnapshot<Map<String, dynamic>> userStory,
  ) {
    print(uid);
    return _FirebaseUserStory(uid, userStory.id, userStory.data()!);
  }

  const _FirebaseUserStory(this.uid, this.storyId, this._data) : super();

  @override
  String toString() =>
      '_FirebaseUserStory($uid, $storyId, $isFavorite, $createdAt)';

  DocumentReference<Map<String, dynamic>> get _userStoryRef => firebaseFirestore
      .collection(userStories)
      .doc(uid)
      .collection(userStoriesSubCache)
      .doc(storyId);

  @override
  bool get isFavorite => _data['isFavorite'];

  @override
  DateTime get createdAt => (_data['createdAt'] as Timestamp).toDate();

  @override
  Future<bool> toggleIsFavorite() async {
    final newIsFavorite = !isFavorite;
    await _userStoryRef.update({'isFavorite': newIsFavorite});
    return newIsFavorite;
  }
}
