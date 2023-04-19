/// A request for a story.
abstract class StoryRequest {
  const StoryRequest();

  String get id;

  StoryRequestStatus get status;
}

enum StoryRequestStatus {
  /// The request is pending.
  pending,

  /// The request succeeded, and the story was created.
  /// Note: this does not necessarily mean that the story is complete.
  created,

  /// The request failed.
  error,
}

StoryRequestStatus tryParseStoryRequestStatus(String status) {
  for (StoryRequestStatus value in StoryRequestStatus.values) {
    if (value.name == status) {
      return value;
    }
  }
  throw Exception("Unrecognized StoryRequestStatus $status");
}
