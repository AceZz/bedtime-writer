/// This file is where the concrete implementation of all abstract classes and
/// generic functions are chosen.

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:tuple/tuple.dart';

import 'firebase/index.dart';
import 'preferences.dart';
import 'shared_preferences/index.dart';
import 'stats.dart';
import 'story.dart';
import 'story_form.dart';
import 'story_part.dart';
import 'story_status.dart';
import 'user.dart';

/**
 * USER
 */

/// Provides the current [User].
final userProvider = Provider<User>((ref) => getFirebaseUser(ref));

/// Resets password for given email
Future<void> Function(String email) resetPassword = firebaseResetPassword;

/**
 * STORY
 */

/// Streams the [Story]s authored by the current [User].
final AutoDisposeStreamProvider<List<Story>> userStoriesProvider =
    firebaseUserStoriesProvider;

/// Streams the [Story]s authored by the current [User] and marked as favorite.
final AutoDisposeStreamProvider<List<Story>> favoriteUserStoriesProvider =
    firebaseFavoriteUserStoriesProvider;

/// Streams a specific [Story].
final AutoDisposeStreamProviderFamily<Story, String> storyProvider =
    firebaseStoryProvider;

/// Streams a specific [StoryPart].
final AutoDisposeStreamProviderFamily<StoryPart, Tuple2<String, String>>
    storyPartProvider = firebaseStoryPartProvider;

/// Creates a story request, and returns the id of the story.
Future<String> Function(StoryAnswers answers) createClassicStory =
    firebaseCreateClassicStory;

/// Streams the [StoryStatus] of a specific story.
final AutoDisposeFutureProviderFamily<StoryStatus, String> storyStatusProvider =
    firebaseStoryStatusProvider;

/// Returns the current [StoryForm]. Has to be overridden with
/// [Provider.overrideWithValue].
final Provider<StoryForm> storyFormProvider =
    Provider((ref) => throw UnimplementedError());

/**
 * PREFERENCES
 */

/// Provides a [Preferences] object and a [PreferencesNotifier] to interact
/// with it.
final NotifierProvider<PreferencesNotifier, Preferences> preferencesProvider =
    sharedPreferencesProvider;

/**
 * STATS
 */

/// Provides a [Stats] object.
final StreamProvider<Stats> statsProvider = firebaseStatsProvider;
