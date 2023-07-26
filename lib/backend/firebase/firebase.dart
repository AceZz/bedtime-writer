/// Contains various Firebase globals.

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:firebase_auth/firebase_auth.dart';

final firebaseAuth = FirebaseAuth.instance;
final firebaseFirestore = FirebaseFirestore.instance;
final firebaseFunctions = FirebaseFunctions.instanceFor(region: 'europe-west6');

/// Tries to get the data of [ref] from the cache. If it fails, returns it from
/// the server (standard behavior).
Future<DocumentSnapshot<Map<String, dynamic>>> getCacheThenServer(
    DocumentReference<Map<String, dynamic>> ref) async {
  try {
    return await ref.get(GetOptions(source: Source.cache));
  } on FirebaseException {
    return await ref.get(GetOptions(source: Source.serverAndCache));
  }
}

/// Sets the Firebase collection names
const STORY_FORMS = 'story__forms';
const STORY_QUESTIONS = 'story__questions';
const STORY_QUESTIONS_CHOICES = 'choices';
const STORY_REALTIME = 'story__realtime';
const USER_STATS = 'user__stats';
