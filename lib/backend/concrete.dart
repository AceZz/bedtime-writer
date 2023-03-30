/// This file is where the concrete implementation of all abstract classes and
/// generic functions are chosen.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'firebase/index.dart';
import 'story.dart';
import 'story_params.dart';
import 'user.dart';

/// Provides the current [User].
final userProvider = Provider<User>((ref) => getFirebaseUser(ref));

/// Streams the [Story]s authored by the current [User].
final AutoDisposeStreamProvider<List<Story>> userStoriesProvider =
    firebaseUserStoriesProvider;

/// Streams the [Story]s authored by the current [User] and marked as favorite.
final AutoDisposeStreamProvider<List<Story>> favoriteUserStoriesProvider =
    firebaseFavoriteUserStoriesProvider;

/// Streams a specific [Story].
final AutoDisposeStreamProviderFamily<Story, String> storyProvider =
    firebaseStoryProvider;

/// Creates a story and return its [Story.id].
Future<String> Function(StoryParams params) addStory = firebaseAddStory;
