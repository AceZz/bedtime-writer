import 'dart:developer';

import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:logging/logging.dart';

import 'firebase.dart';

/// Inspects the environment and configure the Firebase emulators if they should
/// be used.
void configureFirebaseEmulators() {
  if (_useFirebaseEmulators()) {
    log(
      'Use Firebase emulators',
      name: 'backend.configureFirebaseEmulators',
      level: Level.CONFIG.value,
    );

    firebaseAuth.useAuthEmulator('localhost', 9099);
    firebaseFirestore.useFirestoreEmulator('localhost', 8080);
    firebaseFunctions.useFunctionsEmulator('localhost', 5001);
    firebaseStorage.useStorageEmulator('localhost', 9199);
  }
}

bool _useFirebaseEmulators() {
  final config = dotenv.get('USE_FIREBASE_EMULATORS', fallback: 'false');
  return config.toLowerCase() == 'true';
}
