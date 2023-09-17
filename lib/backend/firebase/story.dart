import 'dart:typed_data';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../story/index.dart';
import '../concrete.dart';
import '../story.dart';
import '../story_status.dart';
import '../user.dart';
import 'firebase.dart';
import 'story_part.dart';

Future<String> firebaseCreateClassicStory(CreateStoryState state) async {
  return firebaseFunctions
      .httpsCallable('createClassicStory')
      .call(state.serialize())
      .then((result) => result.data);
}

/// Streams a specific [Story].
final firebaseStoryProvider =
    StreamProvider.autoDispose.family<Story, String>((ref, storyId) {
  final snapshots =
      firebaseFirestore.collection(storyCacheServing).doc(storyId).snapshots();
  return snapshots.map((story) => _FirebaseStory.deserialize(story));
});

/// Streams the [Story]s authored by the current [User].
final firebaseUserStoriesProvider = _userStoriesProvider(
  queryBuilder: userStoriesQueryBuilder,
);

/// Streams the favorite [Story]s authored by the current [User].
final firebaseFavoriteUserStoriesProvider = _userStoriesProvider(
  queryBuilder: (AuthUser user) =>
      userStoriesQueryBuilder(user).where('isFavorite', isEqualTo: true),
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
/// be [userStoriesQueryBuilder] for instance.
AutoDisposeStreamProvider<List<Story>> _userStoriesProvider({
  required Query<Map<String, dynamic>> Function(AuthUser) queryBuilder,
}) {
  return StreamProvider.autoDispose<List<Story>>((ref) {
    final user = ref.watch(userProvider);

    if (user is AuthUser) {
      final snapshots = queryBuilder(user).snapshots();

      return snapshots.map(
        (stories) => stories.docs
            .map((story) => _FirebaseStory.deserialize(story))
            .toList(),
      );
    }

    return const Stream.empty();
  });
}

/// A query that only returns stories authored by [user].
//TODO: adapt below
Query<Map<String, dynamic>> userStoriesQueryBuilder(AuthUser user) =>
    firebaseFirestore
        .collection(storyCacheServing)
        .orderBy('timestamp', descending: true)
        .where('author', isEqualTo: user.uid)
        .where('status', isEqualTo: 'complete');

/// Firebase implementation of [Story].
class _FirebaseStory implements Story {
  @override
  final String id;
  final Map<String, dynamic> _data;

  factory _FirebaseStory.deserialize(
    DocumentSnapshot<Map<String, dynamic>> story,
  ) {
    return _FirebaseStory(story.id, story.data()!);
  }

  const _FirebaseStory(this.id, this._data) : super();

  @override
  String toString() => '_FirebaseStory($title, $author, $dateTime, $numParts)';

  DocumentReference<Map<String, dynamic>> get _storyRef =>
      firebaseFirestore.collection(storyCacheServing).doc(id);

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
  int get numParts => partIds.length;

  @override
  String getPartId(int index) => partIds[index];

  List<dynamic> get partIds => _data['partIds'];

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
