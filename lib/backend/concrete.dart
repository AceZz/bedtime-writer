/// This file is where the concrete implementation of all abstract classes and
/// generic functions are chosen.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'firebase/index.dart';
import 'preferences.dart';
import 'shared_preferences/index.dart';
import 'stats.dart';
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

/// Provides a [Preferences] object and a [PreferencesNotifier] to interact
/// with it.
final NotifierProvider<PreferencesNotifier, Preferences> preferencesProvider =
    sharedPreferencesProvider;

/// Provides a [Stats] object and a [StatsNotifier] to interact
/// with it.
final StreamProvider<Stats> statsProvider = firebaseStatsProvider;

/// Creates a story and return its [Story.id].
Future<String> Function(StoryParams params) addStory = firebaseAddStory;
