import 'package:flutter_dotenv/flutter_dotenv.dart';

bool debugAuth() {
  final debug = dotenv.get('DEBUG_AUTH', fallback: 'false');
  return debug.toLowerCase() == 'true';
}

bool debugStats() {
  final debug = dotenv.get('DEBUG_STATS', fallback: 'false');
  return debug.toLowerCase() == 'true';
}

bool debugStory() {
  final debug = dotenv.get('DEBUG_STORY', fallback: 'false');
  return debug.toLowerCase() == 'true';
}
