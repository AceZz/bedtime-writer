import 'dart:typed_data';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;

import '../index.dart';
import '../story_params.dart';
import 'database.dart';

/// Creates a story and returns its ID.
Future<String> firebaseAddStory(StoryParams params) async {
  return firebaseFunctions
      .httpsCallable('addStory')
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
final firebaseUserStoriesProvider =
    StreamProvider.autoDispose<List<Story>>((ref) {
  final user = ref.watch(userProvider);

  if (user is AuthUser) {
    final snapshots = firebaseFirestore
        .collection('stories')
        .where('author', isEqualTo: user.uid)
        .snapshots();

    return snapshots.map((stories) => stories.docs
        .map((story) => _FirebaseStory.deserialize(story))
        .toList());
  }

  return Stream.empty();
});

/// Firebase implementation of [Story].
class _FirebaseStory implements Story {
  final String id;
  final Map<String, dynamic> _data;

  factory _FirebaseStory.deserialize(
      DocumentSnapshot<Map<String, dynamic>> story) {
    return _FirebaseStory(story.id, story.data()!);
  }

  const _FirebaseStory(this.id, this._data) : super();

  String toString() => '_FirebaseStory($title, $author, $date, $text)';

  @override
  String get title => _data['title'];

  @override
  String get author => _data['author'];

  @override
  DateTime get date => (_data['date'] as Timestamp).toDate();

  @override
  Future<Uint8List> get image async {
    final imageData = _data['image'] as Map<String, dynamic>;

    if (imageData.containsKey('cloudStoragePath')) {
      final bytes = await firebaseStorage
          .ref()
          .child(imageData['cloudStoragePath'])
          .getData();
      if (bytes == null) {
        throw FormatException('Could not download storage image of story $id.');
      }
      return bytes;
    }

    if (imageData.containsKey('providerUrl')) {
      http.Response response =
          await http.get(Uri.parse(imageData['providerUrl']));
      return response.bodyBytes;
    }

    throw FormatException('Story $id has no image.');
  }

  @override
  String get text => _data['text'];
}
