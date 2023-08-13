import 'package:flutter_dotenv/flutter_dotenv.dart';

import '../../logger.dart';
import 'firebase.dart';

/// Inspects the environment and configure the Firebase emulators if they should
/// be used.
void configureFirebaseEmulators() {
  if (_useFirebaseEmulators()) {
    logger.info('Use Firebase emulators');

    firebaseAuth.useAuthEmulator('localhost', 9099);
    firebaseFirestore.useFirestoreEmulator('localhost', 8080);
    firebaseFunctions.useFunctionsEmulator('localhost', 5001);
  }
}

bool _useFirebaseEmulators() {
  final config = dotenv.get('BACKEND', fallback: 'server');
  return config.toLowerCase() == 'local';
}
