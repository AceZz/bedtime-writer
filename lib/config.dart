import 'package:flutter_dotenv/flutter_dotenv.dart';

bool debugAuth() {
  final debug = dotenv.get('DEBUG_AUTH', fallback: 'false');
  return debug.toLowerCase() == 'true';
}

bool debugAuthNoAccountLimit() {
  final debug = dotenv.get('DEBUG_AUTH_NO_ACCOUNT_LIMIT', fallback: 'false');
  return debug.toLowerCase() == 'true';
}

bool debugUserStats() {
  final debug = dotenv.get('DEBUG_USER_STATS', fallback: 'false');
  return debug.toLowerCase() == 'true';
}

bool debugStory() {
  final debug = dotenv.get('DEBUG_STORY', fallback: 'false');
  return debug.toLowerCase() == 'true';
}
