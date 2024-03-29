/// This file is where the concrete implementation of all abstract classes and
/// generic functions are chosen.

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:tuple/tuple.dart';

import '../story/index.dart';
import 'firebase/index.dart';
import 'preferences.dart';
import 'shared_preferences/index.dart';
import 'story.dart';
import 'story_form.dart';
import 'story_part.dart';
import 'story_status.dart';
import 'user.dart';
import 'user_feedback.dart';
import 'user_stats.dart';

/**
 * USER
 */

/// Provides the current [User].
final userProvider = Provider<User>((ref) => getFirebaseUser(ref));

/// Resets password for given email
Future<void> Function(String email) resetPassword = firebaseResetPassword;

/// Creates a story request, and returns the id of the story.
Future<void> Function(UserFeedback feedback) collectUserFeedback =
    firebaseCollectUserFeedback;

/**
 * STORY
 */

/// Streams the [Story]s authored by the current [User].
final AutoDisposeStreamProvider<List<Story>> userStoriesProvider =
    firebaseStoriesProvider;

/// Streams the [Story]s authored by the current [User] and marked as favorite.
final AutoDisposeStreamProvider<List<Story>> favoriteUserStoriesProvider =
    firebaseFavoriteStoriesProvider;

/// Streams a specific [Story].
final AutoDisposeStreamProviderFamily<Story, String> storyProvider =
    firebaseStoryProvider;

/// Streams a specific [StoryPart] identified by `(storyId, partId)`.
final AutoDisposeStreamProviderFamily<StoryPart, Tuple2<String, String>>
    storyPartProvider = firebaseStoryPartProvider;

/// Creates a story request, and returns the id of the story.
Future<String> Function(CreateStoryState state) createClassicStory =
    firebaseCreateClassicStory;

/// Streams the [StoryStatus] of a specific story.
final AutoDisposeFutureProviderFamily<StoryStatus, String> storyStatusProvider =
    firebaseStoryStatusProvider;

/// Returns a random [StoryForm] among those available.
Future<StoryForm> Function() getRandomStoryForm = firebaseGetRandomStoryForm;

/**
 * PREFERENCES
 */

/// Provides a [Preferences] object and a [PreferencesNotifier] to interact
/// with it.
final NotifierProvider<PreferencesNotifier, Preferences> preferencesProvider =
    sharedPreferencesProvider;

/**
 * USER STATS
 */

/// Provides a [UserStats] object.
final StreamProvider<UserStats> userStatsProvider = firebaseUserStatsProvider;
