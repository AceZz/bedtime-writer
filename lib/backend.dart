import 'package:bedtime_writer/story/states/story_params.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:firebase_storage/firebase_storage.dart';

final firestore = FirebaseFirestore.instance;
final functions = FirebaseFunctions.instance;
final storage = FirebaseStorage.instance;

/// A [CollectionReference] to the stories.
final CollectionReference<Map<String, dynamic>> storiesReference =
    firestore.collection('stories');

/// Returns a [DocumentReference] to the story [id].
DocumentReference<Map<String, dynamic>> storyReference(String id) =>
    storiesReference.doc(id);

/// Returns a [Reference] to the image file for the story [id].
Reference storyImageReference(String id) {
  return storage.ref().child('stories/image/$id.png');
}
