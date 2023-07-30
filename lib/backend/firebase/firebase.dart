/// Contains various Firebase globals.

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:firebase_auth/firebase_auth.dart';

import '../../logger.dart';

final firebaseAuth = FirebaseAuth.instance;
final firebaseFirestore = FirebaseFirestore.instance;
final firebaseFunctions = FirebaseFunctions.instanceFor(region: 'europe-west6');

/// Tries to get the data of [ref] from the cache. If it fails, returns it from
/// the server (standard behavior).
Future<DocumentSnapshot<Map<String, dynamic>>> getCacheThenServer(
  DocumentReference<Map<String, dynamic>> ref,
) async {
  return ref.get(const GetOptions(source: Source.cache)).then((value) {
    logger.fine('getCacheThenServer: retrieve ${ref.path} with cache.');
    return value;
  }).onError((error, stackTrace) {
    logger.fine('getCacheThenServer: retrieve ${ref.path} with server.');
    return ref.get(const GetOptions(source: Source.serverAndCache));
  });
}

/// Sets the Firebase collection names
const storyCacheLanding = 'story__cache_landing';
const storyCacheServing = 'story__cache_serving';
const storyFormsLanding = 'story__forms_landing';
const storyFormsServing = 'story__forms_serving';
const storyQuestions = 'story__questions';
const storyQuestionsServing = 'story__questions_serving';
const storyQuestionChoices = 'choices';
const storyRealtime = 'story__realtime';
const userStats = 'user__stats';
