import 'dart:typed_data';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../concrete.dart';
import '../story.dart';
import '../story_params.dart';
import '../story_status.dart';
import '../user.dart';
import 'firebase.dart';
import 'story_part.dart';

Future<String> firebaseCreateClassicStory(StoryParams params) async {
  return firebaseFunctions
      .httpsCallable('createClassicStoryRequest')
      .call(params.serialize())
      .then((result) => result.data);
}

/// Streams a specific [Story].
final firebaseStoryProvider =
    StreamProvider.autoDispose.family<Story, String>((ref, id) {
  final snapshots = firebaseFirestore.collection('stories').doc(id).snapshots();
  return snapshots.map((story) => _FirebaseStory.deserialize(story));
});

/// Streams the [Story]s authored by the current [User].
final firebaseUserStoriesProvider = _userStoriesProvider(
  queryBuilder: _userStoriesQueryBuilder,
);

/// Streams the favorite [Story]s authored by the current [User].
final firebaseFavoriteUserStoriesProvider = _userStoriesProvider(
  queryBuilder: (AuthUser user) =>
      _userStoriesQueryBuilder(user).where('isFavorite', isEqualTo: true),
);

/// Streams a specific [StoryStatus].
final firebaseStoryStatusProvider =
    FutureProvider.autoDispose.family<StoryStatus, String>((ref, id) {
  return ref
      .watch(firebaseStoryProvider(id).selectAsync((story) => story.status));
});

/// Helper to create providers that return lists of [Story].
///
/// The parameter [queryBuilder] transforms a [AuthUser] into a [Query]. It can
/// be [_userStoriesQueryBuilder] for instance.
AutoDisposeStreamProvider<List<Story>> _userStoriesProvider({
  required Query<Map<String, dynamic>> Function(AuthUser) queryBuilder,
}) {
  return StreamProvider.autoDispose<List<Story>>((ref) {
    final user = ref.watch(userProvider);

    if (user is AuthUser) {
      final snapshots = queryBuilder(user).snapshots();

      return snapshots.map((stories) => stories.docs
          .map((story) => _FirebaseStory.deserialize(story))
          .toList());
    }

    return Stream.empty();
  });
}

/// A query that only returns stories authored by [user].
Query<Map<String, dynamic>> _userStoriesQueryBuilder(AuthUser user) =>
    firebaseFirestore
        .collection('stories')
        .orderBy('timestamp', descending: true)
        .where('author', isEqualTo: user.uid)
        .where('status', isEqualTo: "complete");

/// Firebase implementation of [Story].
class _FirebaseStory implements Story {
  final String id;
  final Map<String, dynamic> _data;

  factory _FirebaseStory.deserialize(
    DocumentSnapshot<Map<String, dynamic>> story,
  ) {
    return _FirebaseStory(story.id, story.data()!);
  }

  const _FirebaseStory(this.id, this._data) : super();

  String toString() => '_FirebaseStory($title, $author, $dateTime, $numParts)';

  DocumentReference<Map<String, dynamic>> get _storyRef =>
      firebaseFirestore.collection('stories').doc(id);

  @override
  String get title => _data['title'];

  @override
  String get author => _data['author'];

  @override
  DateTime get dateTime => (_data['timestamp'] as Timestamp).toDate();

  @override
  StoryStatus get status => tryParseStoryRequestStatus(_data['status']);

  @override
  bool get isFavorite => _data['isFavorite'];

  @override
  Future<bool> toggleIsFavorite() async {
    final newIsFavorite = !isFavorite;
    await _storyRef.update({'isFavorite': newIsFavorite});
    return newIsFavorite;
  }

  @override
  int get numParts => parts.length;

  @override
  String getPartId(int index) => parts[index];

  List<dynamic> get parts => _data['parts'];

  CollectionReference<Map<String, dynamic>> get _imagesRef =>
      _storyRef.collection('images');

  @override
  Future<Uint8List?> get thumbnail async {
    if (numParts > 0) {
      final storyPartData = await getCacheThenServer(
        _storyRef.collection('parts').doc(getPartId(0)),
      );
      final storyPart = FirebaseStoryPart.deserialize(
        _imagesRef,
        storyPartData,
      );

      return storyPart.image;
    }
    return null;
  }
}
