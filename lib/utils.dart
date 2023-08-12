import 'dart:developer';

import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:logging/logging.dart';

int parseEnvAsInt(String name, int defaultValue) {
  final rawValue = dotenv.env[name];

  if (rawValue == null) {
    log(
      'parseEnvAsInt: environment variable $name is not defined, using default',
      name: 'main',
      level: Level.CONFIG.value,
    );
    return defaultValue;
  }

  final parsedValue = int.tryParse(rawValue);

  if (parsedValue == null) {
    log(
      'parseEnvAsInt: environment variable $name could not be parsed, '
      'using default',
      name: 'main',
      level: Level.CONFIG.value,
    );
    return defaultValue;
  }

  return parsedValue;
}
