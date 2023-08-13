import 'package:flutter/material.dart';
import 'package:logging/logging.dart';

final logger = Logger('bedtime-writer');

/// Call this in `main.dart` to configure the loggers.
void configureLogging() {
  hierarchicalLoggingEnabled = true;

  Logger.root.level = Level.INFO;
  Logger.root.onRecord.listen(debugPrintRecord);

  // Disable GoRouter spam.
  Logger('GoRouter').level = Level.WARNING;
}

void debugPrintRecord(LogRecord record) {
  debugPrint(
    '[${record.loggerName}][${record.level.name}][${record.time}]: '
    '${record.message}',
  );
}
