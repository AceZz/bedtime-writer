import 'package:flutter/material.dart';

import '../utils.dart';

/// User feedback.
@immutable
class UserFeedback {
  final String text;

  // Creation datetime
  final DateTime datetime;
  final String? uid;

  const UserFeedback({required this.text, required this.datetime, this.uid});

  DynMap serialize() {
    return {
      'text': text,
      'datetime':
          datetime.toIso8601String(), // Convert the DateTime object to a string
      'uid': uid,
    };
  }
}
