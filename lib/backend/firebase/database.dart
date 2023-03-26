import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:firebase_storage/firebase_storage.dart';

import '../../story/states/story_params.dart';

final firebaseFirestore = FirebaseFirestore.instance;
final firebaseFunctions = FirebaseFunctions.instance;
final firebaseStorage = FirebaseStorage.instance;

Future<String> addStory(StoryParams params) async {
  return firebaseFunctions
      .httpsCallable('addStory')
      .call(params.serialize())
      .then((result) => result.data);
}
