import 'package:bedtime_writer/story/states/story_params.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:firebase_storage/firebase_storage.dart';

final firestore = FirebaseFirestore.instance;
final functions = FirebaseFunctions.instance;
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

Future<String> addStory(StoryParams params) async {
  functions.useFunctionsEmulator('10.0.2.2', 5001);
  print('called');

  return functions.httpsCallable('addStory').call(
    {
      'character': {
        'name': params.character?.name ?? '',
        'type': params.character?.type ?? '',
        'power': params.character?.power ?? '',
        'challenge': params.character?.challenge ?? '',
      },
      'age': params.age ?? '',
      'duration': params.duration ?? '',
      'place': params.place ?? '',
      'object': params.object ?? '',
      'moral': params.moral ?? '',
    },
  ).then((result) => result.data);
}
