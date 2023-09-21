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
final firebaseStoriesProvider =
    AutoDisposeFutureProvider<List<Story>>((ref) async {
  final user = ref.watch(userProvider) as AuthUser;
  return await getStories(user, getUserStories);
});

/// Streams the favorite [Story]s authored by the current [User].
final firebaseFavoriteStoriesProvider =
    AutoDisposeFutureProvider<List<Story>>((ref) async {
  final user = ref.watch(userProvider) as AuthUser;
  return await getStories(user, getFavoriteUserStories);
});

/// Streams a specific [StoryStatus].
final firebaseStoryStatusProvider =
    FutureProvider.autoDispose.family<StoryStatus, String>((ref, id) {
  return ref
      .watch(firebaseStoryProvider(id).selectAsync((story) => story.status));
});

Future<List<Story>> getStories(
  AuthUser user,
  Query<Map<String, dynamic>> Function(AuthUser) userStoriesQueryBuilder,
) async {
  // Step 1: Get the story IDs from the user__stories sub-collection, ordered by 'createdAt'
  final List<String> orderedStoryIds = [];
  final Map<String, Timestamp> storyIdstoCreatedAt = {};
  final userSnapshot = await userStoriesQueryBuilder(user)
      .orderBy('createdAt', descending: true)
      .get();
  for (var doc in userSnapshot.docs) {
    orderedStoryIds.add(doc.id);
    storyIdstoCreatedAt[doc.id] = doc.data()['createdAt'] as Timestamp;
  }

  // Step 2: Fetch the documents from cache one by one in parallel
  final futures = orderedStoryIds.map((id) {
    return firebaseFirestore.collection(storyCacheServing).doc(id).get();
  }).toList();

  final List<DocumentSnapshot<Map<String, dynamic>>> docs =
      await Future.wait(futures);

  // Step 3: Deserialize and update create date
  final storyDocs = docs.map((doc) {
    final story = _FirebaseStory.deserialize(doc);
    story.updateDataTimestamp(storyIdstoCreatedAt[doc.id]!);
    return story;
  }).toList();

  return storyDocs;
}

/// A query that only returns stories authored by [user].
Query<Map<String, dynamic>> getUserStories(AuthUser user) {
  return firebaseFirestore
      .collection(userStories)
      .doc(user.uid)
      .collection(userStoriesSubCache);
}

/// A query that only returns favorite stories authored by [user].
Query<Map<String, dynamic>> getFavoriteUserStories(AuthUser user) {
  return getUserStories(user).where('isFavorite', isEqualTo: true);
}

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

  void updateDataTimestamp(Timestamp timestamp) {
    _data['timestamp'] = timestamp;
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
