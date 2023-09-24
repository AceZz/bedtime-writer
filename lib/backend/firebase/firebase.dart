/// Contains various Firebase globals.

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:firebase_auth/firebase_auth.dart';

import '../../logger.dart';
import '../../utils.dart';

final firebaseAuth = FirebaseAuth.instance;
final firebaseFirestore = FirebaseFirestore.instance;
final firebaseFunctions = FirebaseFunctions.instanceFor(region: 'europe-west6');

/// Tries to get the data of [ref] from the cache. If it fails, returns it from
/// the server (standard behavior).
Future<DocumentSnapshot<DynMap>> getCacheThenServer(
  DocumentReference<DynMap> ref,
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
const storyCacheServing = 'story__cache_serving';
const storyFormsServing = 'story__forms_serving';
const storyQuestionsServing = 'story__questions_serving';
const storyQuestionChoices = 'choices';
const storyRealtime = 'story__realtime';
const userStats = 'user__stats';
const userStories = 'user__stories';
const userStoriesCache = 'cache';
