import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:firebase_storage/firebase_storage.dart';

import '../../story/states/story_params.dart';

final firebaseFirestore = FirebaseFirestore.instance;
final firebaseFunctions = FirebaseFunctions.instance;
final firebaseStorage = FirebaseStorage.instance;

/// A [CollectionReference] to the stories.
final CollectionReference<Map<String, dynamic>> storiesReference =
    firebaseFirestore.collection('stories');

/// Returns a [DocumentReference] to the story [id].
DocumentReference<Map<String, dynamic>> storyReference(String id) =>
    storiesReference.doc(id);

/// Returns a [Reference] to the image file for the story [id].
Reference storyImageReference(String id) {
  return firebaseStorage.ref().child('stories/image/$id.png');
}

Future<String> addStory(StoryParams params) async {
  return firebaseFunctions
      .httpsCallable('addStory')
      .call(params.serialize())
      .then((result) => result.data);
}
