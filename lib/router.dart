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
      name: 'settings',
      path: '/settings',
      builder: (context, state) => SettingsScreen(),
    ),
  ],
);
