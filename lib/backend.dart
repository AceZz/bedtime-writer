import 'dart:developer';

import 'package:bedtime_writer/story/states/story_params.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:logging/logging.dart';

final auth = FirebaseAuth.instance;
final firestore = FirebaseFirestore.instance;
final functions = FirebaseFunctions.instance;
final storage = FirebaseStorage.instance;

/// Inspects the environment and configure the Firebase emulators if they should
/// be used.
void configureFirebaseEmulators() {
  if (_useFirebaseEmulators()) {
    log(
      'Use Firebase emulators',
      name: 'backend.configureFirebaseEmulators',
      level: Level.CONFIG.value,
    );

    auth.useAuthEmulator('localhost', 9099);
    firestore.useFirestoreEmulator('localhost', 8080);
    functions.useFunctionsEmulator('localhost', 5001);
    storage.useStorageEmulator('localhost', 9199);
  }
}

bool _useFirebaseEmulators() {
  final config = dotenv.get('USE_FIREBASE_EMULATORS', fallback: 'false');
  return config.toLowerCase() == 'true';
}

final userProvider = StreamProvider<User?>((ref) {
  return auth.authStateChanges();
});

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

Future<String> addStory(StoryParams params) async {
  return functions
      .httpsCallable('addStory')
      .call(params.serialize())
      .then((result) => result.data);
}
