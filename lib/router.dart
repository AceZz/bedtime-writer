import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'account/index.dart';
import 'backend/index.dart';
import 'home/index.dart';
import 'preferences/index.dart';
import 'story/index.dart';

final _key = GlobalKey<NavigatorState>();

const Map<String, String> signInTexts = {
  'library': 'Sign in to access saved stories:',
  'display_story': 'Sign in to access saved stories:',
  'preferences': 'Sign in to access your preferences:',
};
const String defaultSignInText = 'Choose how to sign in:';

/// Returns the redirection to the sign-in page if the user is not registered.
String? _unregisteredRedirect(Ref ref, GoRouterState state) {
  final user = ref.read(userProvider);

  if (user is RegisteredUser) {
    return null;
  }

  return Uri(
    path: '/account/sign-in',
    queryParameters: {'redirectName': state.name, 'redirectPath': state.path},
  ).toString();
}

final routerProvider = Provider<GoRouter>((ref) {
  // We do not want to rebuild the router every time `userProvider` changes.
  // As a result, it is only `read` *inside* callbacks (such as `builder` or
  // `_signInRedirect`).

  return GoRouter(
    navigatorKey: _key,
    routes: [
      GoRoute(
        name: 'home',
        path: '/',
        builder: (context, state) => HomeScreen(),
      ),
      GoRoute(
        name: 'account',
        path: '/account',
        builder: (context, state) => UserAccountScreen(redirect: '/'),
      ),
      GoRoute(
        name: 'sign_in',
        path: '/account/sign-in',
        builder: (context, state) {
          final redirectPath = state.queryParams['redirectPath'] ?? '/';
          final signInText = signInTexts[state.queryParams['redirectName']] ??
              defaultSignInText;
          return SignInScreen(
            redirect: redirectPath,
            signInText: signInText,
          );
        },
      ),
      GoRoute(
        name: 'create_story',
        path: '/story/new',
        builder: (context, state) {
          final user = ref.read(userProvider.select((user) => user));
          if (user is UnauthUser) {
            return FutureBuilder(
              future: user.signInAnonymously(),
              builder: (context, snapshot) => const CreateStoryScreen(),
            );
          }
          return const CreateStoryScreen();
        },
      ),
      GoRoute(
        name: 'library',
        path: '/story/library',
        builder: (context, state) => LibraryScreen(),
        redirect: (context, state) => _unregisteredRedirect(ref, state),
      ),
      GoRoute(
        name: 'display_story',
        path: '/story/library/:id',
        redirect: (context, state) {
          final redirect = _unregisteredRedirect(ref, state);
          final library = state.params['id'] == null ? '/story/library' : null;
          return redirect ?? library;
        },
        builder: (context, state) =>
            DisplayStoryScreen(id: state.params['id'] ?? ''),
      ),
      GoRoute(
        name: 'preferences',
        path: '/preferences',
        builder: (context, state) => PreferencesScreen(),
        redirect: (context, state) => _unregisteredRedirect(ref, state),
      ),
    ],
  );
});
