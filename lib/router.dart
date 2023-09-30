import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'account/index.dart';
import 'backend/index.dart';
import 'home/index.dart';
import 'story/index.dart';

final _key = GlobalKey<NavigatorState>();

const Map<String, String> signInTexts = {
  'library': 'Sign in to access saved stories:',
  'display_story': 'Sign in to access saved stories:',
  'preferences': 'Sign in to access your preferences:',
};
const String defaultSignInText = 'Sign in or create your account:';

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
        builder: (context, state) {
          return const HomeScreen();
        },
      ),
      GoRoute(
        name: 'account',
        path: '/account',
        builder: (context, state) => const UserAccountScreen(redirect: '/'),
      ),
      GoRoute(
        name: 'sign_in',
        path: '/account/sign-in',
        builder: (context, state) {
          final redirectPath = state.uri.queryParameters['redirectPath'] ?? '/';
          final signInText =
              signInTexts[state.uri.queryParameters['redirectName']] ??
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
        builder: (context, state) => const CreateStoryScreen(),
      ),
      GoRoute(
        name: 'library',
        path: '/story/library',
        builder: (context, state) => const LibraryScreen(),
        redirect: (context, state) => _unregisteredRedirect(ref, state),
      ),
      GoRoute(
        name: 'display_story',
        path: '/story/library/:id',
        redirect: (context, state) {
          final redirect = _unregisteredRedirect(ref, state);
          final library =
              state.pathParameters['id'] == null ? '/story/library' : null;
          return redirect ?? library;
        },
        builder: (context, state) =>
            DisplayStoryScreen(storyId: state.pathParameters['id'] ?? ''),
      ),
    ],
  );
});
