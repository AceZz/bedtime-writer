import 'package:flutter_dotenv/flutter_dotenv.dart';

bool useFirebaseEmulators() {
  final config = dotenv.get('USE_FIREBASE_EMULATORS', fallback: 'false');
  return config.toLowerCase() == 'true';
}
