import 'package:flutter_dotenv/flutter_dotenv.dart';

import 'logger.dart';

/// A [Map] with [String] keys and dynamic values.
typedef DynMap = Map<String, dynamic>;

int parseEnvAsInt(String name, int defaultValue) {
  final rawValue = dotenv.env[name];

  if (rawValue == null) {
    logger.warning(
      'parseEnvAsInt: environment variable $name is not defined, using default',
    );
    return defaultValue;
  }

  final parsedValue = int.tryParse(rawValue);

  if (parsedValue == null) {
    logger.warning(
      'parseEnvAsInt: environment variable $name could not be parsed, '
      'using default',
    );
    return defaultValue;
  }

  return parsedValue;
}
