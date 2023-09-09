import 'dart:typed_data';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:tuple/tuple.dart';

import '../story_part.dart';
import 'firebase.dart';

/// Streams a specific [StoryPart] identified by `(storyId, partId)`.
final firebaseStoryPartProvider = StreamProvider.autoDispose
    .family<StoryPart, Tuple2<String, String>>((ref, ids) {
  final storyRef = firebaseFirestore.collection(storyRealtime).doc(ids.item1);
  final imagesRef = storyRef.collection('images');
  final snapshots = storyRef.collection('parts').doc(ids.item2).snapshots();
  return snapshots
      .map((storyPart) => FirebaseStoryPart.deserialize(imagesRef, storyPart));
});

/// Firebase implementation of [StoryPart].
class FirebaseStoryPart implements StoryPart {
  final String id;
  final CollectionReference<Map<String, dynamic>> _imagesRef;
  final Map<String, dynamic> _data;

  factory FirebaseStoryPart.deserialize(
    CollectionReference<Map<String, dynamic>> imagesRef,
    DocumentSnapshot<Map<String, dynamic>> part,
  ) {
    return FirebaseStoryPart(part.id, imagesRef, part.data()!);
  }

  const FirebaseStoryPart(this.id, this._imagesRef, this._data) : super();

  @override
  String toString() => '_FirebaseStoryPart(${text.substring(0, 20)}...)';

  @override
  bool get hasImage => _data['image'] != null;

  @override
  Future<Uint8List> get image async {
    final image = await getCacheThenServer(_imageRef);
    return image.data()!['data'].bytes;
  }

  DocumentReference<Map<String, dynamic>> get _imageRef {
    final imageId = _data['image'];
    return _imagesRef.doc(imageId);
  }

  @override
  String get text => _data['text'];
}
