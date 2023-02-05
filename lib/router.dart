import 'package:go_router/go_router.dart';

import 'story/index.dart';

final GoRouter router = GoRouter(
  routes: [
    GoRoute(
      name: 'create_story',
      path: '/',
      builder: (context, state) => CreateStoryScreen(),
    ),
  ],
);
