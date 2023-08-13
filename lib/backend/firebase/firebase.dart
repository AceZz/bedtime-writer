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
const storyRealtime = 'story__realtime';
const userStats = 'user__stats';
