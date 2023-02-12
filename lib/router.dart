import 'package:go_router/go_router.dart';

import 'home/index.dart';
import 'settings/index.dart';
import 'story/index.dart';

final GoRouter router = GoRouter(
  routes: [
    GoRoute(
      name: 'home',
      path: '/',
      builder: (context, state) => HomeScreen(),
    ),
    GoRoute(
      name: 'create_story',
      path: '/story/new',
      builder: (context, state) => CreateStoryScreen(),
    ),
    GoRoute(
      name: 'library',
      path: '/story/library',
      builder: (context, state) => LibraryScreen(),
    ),
    GoRoute(
      name: 'display_story',
      path: '/story/library/:id',
      redirect: (state) => state.params['id'] == null ? '/story/library' : null,
      builder: (context, state) =>
          DisplayStoryScreen(id: state.params['id'] ?? ''),
    ),
    GoRoute(
      name: 'settings',
      path: '/settings',
      builder: (context, state) => SettingsScreen(),
    ),
  ],
);
