import 'package:flutter/material.dart';

import '../utils.dart';

/// User feedback.
@immutable
class UserFeedback {
  final String text;

  // Creation datetime
  final DateTime createdAt;
  final String? uid;

  const UserFeedback({required this.text, required this.createdAt, this.uid});

  DynMap serialize() {
    return {
      'text': text,
      'createdAt':
          createdAt.toIso8601String(), // Convert the DateTime object to a string
      'uid': uid,
    };
  }
}
