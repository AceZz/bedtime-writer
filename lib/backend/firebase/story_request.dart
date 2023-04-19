import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../story_request.dart';
import 'firebase.dart';

/// Streams a specific [StoryRequest].
final firebaseStoryRequestProvider =
    StreamProvider.autoDispose.family<StoryRequest, String>((ref, id) {
  final snapshots =
      firebaseFirestore.collection('requests_v1').doc(id).snapshots();
  return snapshots.map((request) => _FirebaseStoryRequest.deserialize(request));
});

/// Firebase implementation of [StoryRequest].
class _FirebaseStoryRequest implements StoryRequest {
  final String id;
  final StoryRequestStatus status;

  factory _FirebaseStoryRequest.deserialize(
    DocumentSnapshot<Map<String, dynamic>> request,
  ) {
    final data = request.data()!;
    return _FirebaseStoryRequest(
        request.id, tryParseStoryRequestStatus(data['status']));
  }

  const _FirebaseStoryRequest(this.id, this.status) : super();

  String toString() => '_FirebaseStoryRequest($id, $status)';
}
