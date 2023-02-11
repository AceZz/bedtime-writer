import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_storage/firebase_storage.dart';

final firestore = FirebaseFirestore.instance;
final storageRef = FirebaseStorage.instance.ref();

/// A [CollectionReference] to the stories.
final CollectionReference<Map<String, dynamic>> storiesReference =
    firestore.collection('stories');

/// Returns a [DocumentReference] to the story [id].
DocumentReference<Map<String, dynamic>> storyReference(String id) =>
    storiesReference.doc(id);

/// Returns a [Reference] to the image file for the story [id].
Reference storyImageReference(String id) =>
    storageRef.child('stories/image/$id.jpg');
