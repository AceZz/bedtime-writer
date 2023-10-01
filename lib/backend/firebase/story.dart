import 'dart:typed_data';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:tuple/tuple.dart';

import '../../story/index.dart';
import '../../utils.dart';
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

/// Provides the [_FirebaseStory] called [storyId] for the current user.
final firebaseStoryProvider =
    AutoDisposeStreamProviderFamily<_FirebaseStory, String>((ref, storyId) {
  final user = ref.read(userProvider);
  final uid = user is AuthUser ? user.uid : '';

  final userStory = ref.watch(_userStoryProvider(Tuple2(uid, storyId))).value;
  final story = ref.watch(_storyProvider(storyId)).value;

  if (userStory == null || story == null) {
    return const Stream.empty();
  }

  return Stream.value(_FirebaseStory.deserialize(uid, story, userStory));
});

/// Streams the data of a story, found in [storyCacheServing].
final _storyProvider =
    AutoDisposeStreamProviderFamily<DocumentSnapshot<DynMap>, String>(
        (ref, storyId) {
  return firebaseFirestore
      .collection(storyCacheServing)
      .doc(storyId)
      .snapshots();
});

/// Streams the metadata of the story [storyId] belonging to user [uid], found
/// in [userStories]. [param] is [uid], [storyId].
final _userStoryProvider = AutoDisposeStreamProviderFamily<
    DocumentSnapshot<DynMap>, Tuple2<String, String>>((ref, param) {
  return firebaseFirestore
      .collection(userStories)
      .doc(param.item1)
      .collection(userStoriesCache)
      .doc(param.item2)
      .snapshots();
});

/// Streams a specific [StoryStatus].
final firebaseStoryStatusProvider =
    FutureProvider.autoDispose.family<StoryStatus, String>((ref, id) {
  return ref
      .watch(firebaseStoryProvider(id).selectAsync((story) => story.status));
});

/// Streams the [Story]s authored by the current [User].
final firebaseStoriesProvider = AutoDisposeStreamProvider<List<Story>>((ref) {
  final user = ref.watch(userProvider) as AuthUser;
  return _storiesStream(ref, userStoriesQuery(user));
});

/// Streams the favorite [Story]s authored by the current [User].
final firebaseFavoriteStoriesProvider =
    AutoDisposeStreamProvider<List<Story>>((ref) {
  final user = ref.watch(userProvider) as AuthUser;
  return _storiesStream(
    ref,
    userStoriesQuery(user).where('isFavorite', isEqualTo: true),
  );
});

/// A query that only returns stories authored by [user].
Query<DynMap> userStoriesQuery(AuthUser user) {
  return firebaseFirestore
      .collection(userStories)
      .doc(user.uid)
      .collection(userStoriesCache);
}

/// Provides stories from a [Query].
Stream<List<_FirebaseStory>> _storiesStream(
  AutoDisposeStreamProviderRef ref,
  Query<DynMap> query,
) {
  final userStories = ref.watch(_userStoriesProvider(query)).value;

  if (userStories == null) {
    return const Stream.empty();
  }

  final stories = userStories.docs
      .map((doc) => ref.watch(firebaseStoryProvider(doc.id)).value)
      .whereType<_FirebaseStory>()
      .toList();
  return Stream.value(stories);
}

/// Streams user stories.
final _userStoriesProvider =
    AutoDisposeStreamProviderFamily<QuerySnapshot<DynMap>, Query<DynMap>>(
        (ref, query) {
  return query.orderBy('createdAt', descending: true).snapshots();
});

/// Firebase implementation of [Story].
class _FirebaseStory implements Story {
  @override
  final String id;

  final String uid;

  final DynMap _storyData;

  final DynMap _userStoryData;

  factory _FirebaseStory.deserialize(
    String uid,
    DocumentSnapshot<DynMap> story,
    DocumentSnapshot<DynMap> userStory,
  ) {
    return _FirebaseStory(story.id, uid, story.data()!, userStory.data()!);
  }

  const _FirebaseStory(this.id, this.uid, this._storyData, this._userStoryData)
      : super();

  @override
  String toString() => '_FirebaseStory($title, $author, $createdAt, $numParts)';

  @override
  String get title => _storyData['title'];

  @override
  String get author => _storyData['author'];

  @override
  DateTime get createdAt => (_userStoryData['createdAt'] as Timestamp).toDate();

  @override
  StoryStatus get status => tryParseStoryRequestStatus(_storyData['status']);

  @override
  bool get isFavorite => _userStoryData['isFavorite'];

  @override
  Future<bool> toggleIsFavorite() async {
    final newIsFavorite = !isFavorite;
    await _userStoryRef.update({'isFavorite': newIsFavorite});
    return newIsFavorite;
  }

  @override
  int get numParts => partIds.length;

  @override
  String getPartId(int index) => partIds[index];

  List<dynamic> get partIds => _storyData['partIds'];

  CollectionReference<DynMap> get _imagesRef => _storyRef.collection('images');

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

  DocumentReference<DynMap> get _userStoryRef => firebaseFirestore
      .collection(userStories)
      .doc(uid)
      .collection(userStoriesCache)
      .doc(id);

  DocumentReference<DynMap> get _storyRef =>
      firebaseFirestore.collection(storyCacheServing).doc(id);
}
