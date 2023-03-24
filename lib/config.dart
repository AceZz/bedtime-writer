import 'package:flutter_dotenv/flutter_dotenv.dart';

bool debugMode() {
  final debug = dotenv.get('DEBUG', fallback: 'false');
  return debug.toLowerCase() == 'true';
}
