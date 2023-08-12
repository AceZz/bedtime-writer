enum StoryStatus {
  /// The story was requested, but generation has not started.
  pending,

  /// At least one part of the story is available, but the story is not complete.
  generating,

  /// Story was fully generated.
  complete,

  /// The request failed.
  error,
}

StoryStatus tryParseStoryRequestStatus(String status) {
  for (StoryStatus value in StoryStatus.values) {
    if (value.name == status) {
      return value;
    }
  }
  throw Exception('Unrecognized StoryStatus $status');
}
