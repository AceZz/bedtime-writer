import 'package:go_router/go_router.dart';

import 'home_screen/index.dart';
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
      path: '/create_story',
      builder: (context, state) => CreateStoryScreen(),
    ),
  ],
);
