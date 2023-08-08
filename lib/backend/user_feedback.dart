import 'package:flutter/material.dart';

/// User feedback.
@immutable
class UserFeedback {
  final String text;
  final DateTime datetime; // Timestamp for when the feedback was created
  final String? uid;

  const UserFeedback({required this.text, required this.datetime, this.uid});

  Map<String, dynamic> serialize() {
    return {
      'text': text,
      'datetime':
          datetime.toIso8601String(), // Convert the DateTime object to a string
      'uid': uid,
    };
  }
}
