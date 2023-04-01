import 'package:flutter_dotenv/flutter_dotenv.dart';

bool debugAuth() {
  final debug = dotenv.get('DEBUG_AUTH', fallback: 'false');
  return debug.toLowerCase() == 'true';
}
