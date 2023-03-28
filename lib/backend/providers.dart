import 'package:bedtime_writer/backend/story_params.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'firebase/index.dart';
import 'story.dart';
import 'user.dart';

// Note: this file can be seen as where the concrete implementation of all
// abstract classes are chosen.

/// Provides the current [User].
final userProvider = Provider<User>((ref) => getFirebaseUser(ref));

/// Streams the [Story]s authored by the current [User].
final AutoDisposeStreamProvider<List<Story>> userStoriesProvider =
    firebaseUserStoriesProvider;

/// Streams a specific [Story].
final AutoDisposeStreamProviderFamily<Story, String> storyProvider =
    firebaseStoryProvider;

/// Creates a story and return its [Story.id].
Future<String> Function(StoryParams params) addStory = firebaseAddStory;
